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
    const ispartyExistd = await tx.party.findFirst({
      where: {
        id: payLoad.partyId,
        partyType: PartyType.PARTY,
      },
    });

    if (!ispartyExistd) {
      throw new AppError(StatusCodes.NOT_FOUND, "PARTY not found");
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
        partyId: payLoad.partyId,
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
    if (!Array.isArray(payLoad.creditItem) || payLoad.creditItem.length < 1) {
      throw new Error("Invalid data: Credit item must be a non-empty");
    }
    let journalEntries: any[] = []
    await payLoad.creditItem.map(
      (item: {
        logOrderId: number;
        accountsItemId: number;
        creditAmount: number;
        narration: string;
      }) => {
        journalEntries.push({
          transectionId: transactionInfo.id,
          accountsItemId: item.accountsItemId,
          date: payLoad.date,
          creditAmount: item.creditAmount,
          narration: item?.narration || "",
        })
      }
    );
    const inventoryLedgerItem = await prisma.accountsItem.findFirst({
      where: {
        accountsItemName: {
          contains: "inventory",
        }
      }
    })
    if (!inventoryLedgerItem) {
      throw new AppError(StatusCodes.NOT_FOUND, "Inventory ledger item not found");
    }
    journalEntries.push({
      transectionId: transactionInfo.id,
      accountsItemId: inventoryLedgerItem.id,
      date: payLoad.date,
      debitAmount: payLoad.logOrderTotalAmount,
      narration: payLoad.narration || "inventory",
    })
    const debitAmount = journalEntries.reduce((acc: number, item: any) => acc + item.debitAmount, 0);
    const creditAmount = journalEntries.reduce((acc: number, item: any) => acc + item.creditAmount, 0);

    if (debitAmount !== creditAmount) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Debit and credit amount does not match");
    }

    await tx.journal.createMany({
      data: journalEntries,
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
