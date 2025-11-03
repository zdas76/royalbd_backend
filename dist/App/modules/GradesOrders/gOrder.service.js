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
exports.GradesOrderService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const getAllOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.transactionInfo.findMany({
        where: {
            voucherType: client_1.VoucherType.LOGORADES,
        },
    });
    return result;
});
const createGradesOrder = (payLoad) => __awaiter(void 0, void 0, void 0, function* () {
    const creadtOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const isSupplierExistd = yield tx.party.findFirst({
            where: {
                id: payLoad.supplierId,
                partyType: client_1.PartyType.SUPPLIER,
            },
        });
        if (!isSupplierExistd) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Supplier not found");
        }
        const isLogGradesExisted = yield Promise.all(payLoad.logOrderItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (item.logGradeId && item.quantity) {
                return yield tx.logGrades.findFirst({
                    where: { id: item.logGradeId },
                });
            }
            return null;
        })));
        if (isLogGradesExisted.some((item) => !item)) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Log grad not found");
        }
        const transactionInfo = yield tx.transactionInfo.create({
            data: {
                invoiceNo: payLoad.chalanNo || null,
                voucherNo: payLoad.voucherNo,
                voucherType: client_1.VoucherType.LOGORADES,
                partyId: payLoad.supplierId,
            },
        });
        const orderItem = payLoad.logOrderItem.map((item) => ({
            transectionId: transactionInfo.id,
            logGradeId: item.logGradeId,
            radis: item.radis,
            height: item.height,
            quantity: item.quantity,
            u_price: item.u_price,
            amount: item.amount,
        }));
        yield tx.logOrderItem.createMany({
            data: orderItem,
        });
        if (!Array.isArray(payLoad.creditItem) || payLoad.creditItem.length === 0) {
            throw new Error("Invalid data: Credit item must be a non-empty");
        }
        const creditJournalItem = payLoad.creditItem.map((item) => ({
            transectionId: transactionInfo.id,
            accountsItemId: item.accountsItemId,
            date: payLoad.date,
            creditAmount: item.creditAmount,
            narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
        }));
        yield tx.journal.createMany({
            data: creditJournalItem,
        });
        const logItemByCategoryData = payLoad.logItemsByCategory.map((item) => ({
            transectionId: transactionInfo.id,
            logCategoryId: item.logId,
            date: payLoad.date,
            quantityAdd: item.quantity,
            debitAmount: item.amount,
            unitPrice: item.unitPriceByCategory,
        }));
        yield tx.logOrdByCategory.createMany({
            data: logItemByCategoryData,
        });
        const result = yield tx.transactionInfo.findFirst({
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
    }));
    return creadtOrder;
});
//Get Log Total value
const getLogTotalByCagetoryId = (payLoad) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$queryRaw `
  
SELECT 
i.logCategoryId,

 SUM(IFNULL(i.quantityAdd, 0) - IFNULL(i.quantityLess, 0)) AS netQuantity,
 SUM(IFNULL(i.debitAmount, 0)- IFNULL(i.creditAmount, 0)) AS netAmount
    
  FROM log_order_by_category i
  WHERE i.logCategoryId = ${payLoad.logCategoryId} AND i.date >= ${new Date(payLoad.date)}
  GROUP BY i.logCategoryId`;
    return result;
});
exports.GradesOrderService = {
    createGradesOrder,
    getAllOrder,
    getLogTotalByCagetoryId,
};
