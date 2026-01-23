import { date } from "zod";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { TlogOrderItems } from "./order.types";
import { LogOrderItem, PartyType, VoucherType } from "../../../../generated/prisma";

const getAllOrder = async () => {
  const result = await prisma.transactionInfo.findMany({
    where: {
      voucherType: VoucherType.LOGORADES,
    },
  });

  return result;
};

const createGradesOrder = async (payLoad: any) => {
  const creadtOrder = await prisma.$transaction(async (tx) => {
    const isSupplierExistd = await tx.party.findFirst({
      where: {
        id: payLoad.supplierId,
        partyType: PartyType.SUPPLIER,
      },
    });

    if (!isSupplierExistd) {
      throw new AppError(StatusCodes.NOT_FOUND, "Supplier not found");
    }

    const isLogGradesExisted = await Promise.all(
      payLoad.logOrderItem.map(async (item: LogOrderItem) => {
        if (item.logGradeId && item.quantity) {
          return await tx.logGrades.findFirst({
            where: { id: item.logGradeId },
          });
        }
        return null;
      })
    );

    if (isLogGradesExisted.some((item) => !item)) {
      throw new AppError(StatusCodes.NOT_FOUND, "Log grad not found");
    }

    const transactionInfo = await tx.transactionInfo.create({
      data: {
        invoiceNo: payLoad.chalanNo || null,
        voucherNo: payLoad.voucherNo,
        voucherType: VoucherType.LOGORADES,
        partyId: payLoad.supplierId,
      },
    });

    const orderItem = payLoad.logOrderItem.map((item: TlogOrderItems) => ({
      transectionId: transactionInfo.id,
      logGradeId: item.logGradeId,
      radis: item.radis,
      height: item.height,
      quantity: item.quantity,
      u_price: item.u_price,
      amount: item.amount,
    }));

    await tx.logOrderItem.createMany({
      data: orderItem,
    });

    if (!Array.isArray(payLoad.creditItem) || payLoad.creditItem.length === 0) {
      throw new Error("Invalid data: Credit item must be a non-empty");
    }

    const creditJournalItem = payLoad.creditItem.map(
      (item: {
        logOrderId: number;
        accountsItemId: number;
        creditAmount: number;
        narration: string;
      }) => ({
        transectionId: transactionInfo.id,
        accountsItemId: item.accountsItemId,
        date: payLoad.date,
        creditAmount: item.creditAmount,
        narration: item?.narration || "",
      })
    );

    await tx.journal.createMany({
      data: creditJournalItem,
    });

    const logItemByCategoryData = payLoad.logItemsByCategory.map(
      (item: {
        logId: any;
        date: any;
        unitPriceByCategory: any;
        quantity: any;
        amount: any;
      }) => ({
        transectionId: transactionInfo.id,
        logCategoryId: item.logId,
        date: payLoad.date,
        quantityAdd: item.quantity,
        debitAmount: item.amount,
        unitPrice: item.unitPriceByCategory,
      })
    );

    await tx.logOrdByCategory.createMany({
      data: logItemByCategoryData,
    });

    const result = await tx.transactionInfo.findFirst({
      where: {
        id: transactionInfo.id,
      },
      include: {
        logOrderItem: true,
        logOrdByCategory: {
          include: {
            logCategory: true,
          },
        },
        journal: {
          include: {
            accountsItem: true,
          },
        },
        bankTransaction: true,
      },
    });
    return result;
  });

  return creadtOrder;
};

//Get Log Total value
const getLogTotalByCagetoryId = async (payLoad: any) => {
  const result = await prisma.$queryRaw`
  
SELECT 
i.logCategoryId,

 SUM(IFNULL(i.quantityAdd, 0) - IFNULL(i.quantityLess, 0)) AS netQuantity,
 SUM(IFNULL(i.debitAmount, 0)- IFNULL(i.creditAmount, 0)) AS netAmount
    
  FROM log_order_by_category i
  WHERE i.logCategoryId = ${payLoad.logCategoryId} AND i.date >= ${new Date(
    payLoad.date
  )}
  GROUP BY i.logCategoryId`;

  return result;
};

export const GradesOrderService = {
  createGradesOrder,
  getAllOrder,
  getLogTotalByCagetoryId,
};
