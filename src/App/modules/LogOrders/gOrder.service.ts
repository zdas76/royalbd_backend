import { date } from "zod";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { TlogOrderItems } from "./order.types";
import { LogOrderItem, PartyType, VoucherType } from "../../../../generated/prisma";

const getAllOrder = async ({ startDate, endDate, searchTerm }: { startDate?: Date, endDate?: Date, searchTerm?: string }) => {


  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }
  const result = await prisma.transactionInfo.findMany({
    where: {
      voucherType: VoucherType.LOGORDERS,
      date: {
        gte: startDate ? startDate : undefined,
        lte: endDate ? endDate : undefined,
      },

      OR: [
        {
          voucherNo: {
            contains: searchTerm,
          },
        },
        {
          party: {
            name: {
              contains: searchTerm,
            },
          },
        },

      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      party: {
        select: {
          name: true,
          contactNo: true,
          address: true,
          partyType: true,
        }
      },
    }
  });

  return result;
};

const getLogOrderById = async (payload: any) => {

  if (!payload.voucherNo) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Voucher no is required");
  }


  const result = await prisma.transactionInfo.findFirst({
    where: {
      voucherNo: payload.voucherNo,
      voucherType: VoucherType.LOGORDERS,
    },
    include: {
      party: {
        select: {
          name: true,
          contactNo: true,
          address: true,
          partyType: true,
        }
      },
      journal: {
        include: {
          accountsItem: {
            select: {
              accountsItemName: true,
            }
          }
        }
      },
      logOrderItem: {
        include: {
          logGrades: {
            select: {
              gradeName: true,
              logCategory: {
                select: {
                  name: true,
                }
              }
            }

          },
        }
      },
      logOrdByCategory: {
        include: {
          logCategory: {
            select: {
              name: true,
            }
          }
        }
      },
      bankTransaction: true,
      inventory: true,
      customer: true,
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
        date: payLoad.date,
        voucherType: VoucherType.LOGORDERS,
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
  getLogOrderById,
  getLogTotalByCagetoryId,
};
