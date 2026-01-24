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
exports.ReportService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const getAccountLedgerReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const accountsItemId = Number(payload.accountsItemId);
    const { startDate, endDate } = payload;
    const isExisted = yield prisma_1.default.accountsItem.findFirst({
        where: {
            id: accountsItemId,
        },
    });
    if (!isExisted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Accounts Item not found");
    }
    if (startDate && endDate) {
        const result = yield prisma_1.default.journal.findMany({
            where: {
                accountsItemId: accountsItemId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: {
                date: "asc",
            },
            select: {
                accountsItem: true,
                date: true,
                debitAmount: true,
                creditAmount: true,
                narration: true,
            },
        });
        return result;
    }
    else {
        const result = yield prisma_1.default.journal.findMany({
            where: {
                accountsItemId: accountsItemId,
            },
            orderBy: {
                date: "asc",
            },
            select: {
                accountsItem: true,
                date: true,
                debitAmount: true,
                creditAmount: true,
                narration: true,
            },
        });
        return result;
    }
});
const partyLedgerReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const partyId = Number(payload.partyId);
    const { startDate, endDate } = payload;
    const party = yield prisma_1.default.party.findFirst({
        where: { id: partyId },
    });
    if (!party) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Party not found");
    }
    const closingDate = new Date("2025-01-01");
    if (startDate && endDate) {
        const result = yield prisma_1.default.journal.findMany({
            where: {
                transactionInfo: {
                    partyId: partyId,
                },
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: {
                date: "asc",
            },
            select: {
                date: true,
                transactionInfo: true,
                debitAmount: true,
                creditAmount: true,
                narration: true,
            },
        });
        return result;
    }
    else {
        const result = yield prisma_1.default.journal.findMany({
            where: {
                transactionInfo: {
                    partyId: partyId,
                },
                date: {
                    gt: new Date(closingDate.setDate(closingDate.getDate() + 1)),
                },
            },
            orderBy: {
                date: "asc",
            },
            select: {
                transectionId: true,
                accountsItem: {
                    select: {
                        accountsItemName: true,
                    },
                },
                date: true,
                creditAmount: true,
                debitAmount: true,
                narration: true,
            },
        });
        return result;
    }
});
// raw report
const rawReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const allrawMaterial = yield prisma_1.default.rawMaterial.findMany({
        where: {
            isDeleted: false
        },
    });
    if (allrawMaterial.length < 1) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Raw Material not found");
    }
    const result = Promise.all(allrawMaterial.map((rawMaterial) => __awaiter(void 0, void 0, void 0, function* () {
        return (yield prisma_1.default.inventory.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true
            },
            where: {
                AND: [
                    {
                        rawId: rawMaterial.id
                    },
                    {
                        date: {
                            gte: new Date((payload === null || payload === void 0 ? void 0 : payload.startDate) || ""),
                            lte: new Date((payload === null || payload === void 0 ? void 0 : payload.endDate) || "")
                        }
                    }
                ]
            },
        }));
    })));
    console.log(result);
    return result;
});
exports.ReportService = {
    getAccountLedgerReport,
    partyLedgerReport,
    rawReport,
};
