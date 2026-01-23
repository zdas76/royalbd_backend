import { date, promise } from "zod";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";


const createLogToRowIntoDB = async (payLoad: any) => {
  const createLogOrdrByCategory = await prisma.$transaction(async (tx) => {
    const isExistedLogCagetory = await tx.logCategory.findFirst({
      where: {
        id: payLoad.logCategoryId,
      },
    });

    if (!isExistedLogCagetory) {
      throw new AppError(StatusCodes.NOT_FOUND, "Log Category not found");
    }

    const isExistedRaw = await tx.logCategory.findFirst({
      where: {
        id: payLoad.logCategoryId,
      },
    });

    if (!isExistedRaw) {
      throw new AppError(StatusCodes.NOT_FOUND, "Raw Material not found");
    }

    const logOrderByCategoryData = await tx.logOrdByCategory.create({
      data: {
        logCategoryId: payLoad.logCategoryId,
        date: new Date(payLoad.date),
        quantityLess: Number(payLoad.quantity),
        creditAmount: Number(payLoad.amount),
        unitPrice: Number((payLoad.amount / payLoad.quantity).toFixed(2)),
      },
    });

    // Create inventory with nested journal using individual create calls
    const unitPrice = Number((payLoad.amount / payLoad.quantity).toFixed(2));

    const inventory = await tx.inventory.create({
      data: {
        date: new Date(payLoad.date),
        rawId: payLoad.rawId,
        quantityAdd: Number(payLoad.quantity),
        unitPrice: unitPrice,
        debitAmount: Number(payLoad.amount),
      },
    });
    const createLogToRaw = await tx.logToRaw.create({
      data: {
        date: new Date(payLoad.date),
        voucherNo: payLoad.vaucher,
        inventoryId: inventory.id,
        logCategoryId: logOrderByCategoryData.id,
      },
    });

    return createLogToRaw;
  });

  return await prisma.logToRaw.findFirst({
    where: {
      id: createLogOrdrByCategory.id,
      voucherNo: createLogOrdrByCategory.voucherNo,
    },
    include: {
      inventory: true,
      logOrdByCategory: true,
    },
  });
};

const getAllLogToRaw = async () => {
  const result = await prisma.logToRaw.findMany({
    include: {
      inventory: true,
      logOrdByCategory: true,
    },
  });

  return result;
};

const getLogToRawById = async (id: number) => {
  const result = await prisma.logToRaw.findFirst({
    where: {
      id,
    },
    include: {
      inventory: true,
      logOrdByCategory: true,
    },
  });

  return result;
};

// const updateLogCategoryById = async (id: number, payLoad: LogCategory) => {
//   console.log(payLoad);
//   const result = await prisma.logCategory.update({
//     where: {
//       id,
//     },
//     data: payLoad,
//   });

//   return result;
// };

export const LogToRawService = {
  createLogToRowIntoDB,
  getAllLogToRaw,
  getLogToRawById,
};
