"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogToRawService = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createLogToRowIntoDB = (payLoad) => __awaiter(void 0, void 0, void 0, function* () {
    const createLogOrdrByCategory = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const isExistedLogCagetory = yield tx.logCategory.findFirst({
            where: {
                id: payLoad.logCategoryId,
            },
        });
        if (!isExistedLogCagetory) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Log Category not found");
        }
        const isExistedRaw = yield tx.logCategory.findFirst({
            where: {
                id: payLoad.logCategoryId,
            },
        });
        if (!isExistedRaw) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Raw Material not found");
        }
        const logOrderByCategoryData = yield tx.logOrdByCategory.create({
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
        const inventory = yield tx.inventory.create({
            data: {
                date: new Date(payLoad.date),
                rawId: payLoad.rawId,
                quantityAdd: Number(payLoad.quantity),
                unitPrice: unitPrice,
                debitAmount: Number(payLoad.amount),
            },
        });
        const createLogToRaw = yield tx.logToRaw.create({
            data: {
                date: new Date(payLoad.date),
                voucherNo: payLoad.vaucher,
                inventoryId: inventory.id,
                logCategoryId: logOrderByCategoryData.id,
            },
        });
        return createLogToRaw;
    }));
    return yield prisma_1.default.logToRaw.findFirst({
        where: {
            id: createLogOrdrByCategory.id,
            voucherNo: createLogOrdrByCategory.voucherNo,
        },
        include: {
            inventory: true,
            logOrdByCategory: true,
        },
    });
});
const getAllLogToRaw = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.logToRaw.findMany({
        include: {
            inventory: true,
            logOrdByCategory: true,
        },
    });
    return result;
});
const getLogToRawById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.logToRaw.findFirst({
        where: {
            id,
        },
        include: {
            inventory: true,
            logOrdByCategory: true,
        },
    });
    return result;
});
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
exports.LogToRawService = {
    createLogToRowIntoDB,
    getAllLogToRaw,
    getLogToRawById,
};
