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
    if (!partyId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Party Id is required");
    }
    const party = yield prisma_1.default.party.findFirst({
        where: { id: partyId },
    });
    if (!party) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Party not found");
    }
    let accountsItemId;
    if (payload.partyType === 'SUPPLIER') {
        const accountsItem = yield prisma_1.default.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "accounts payable"
                },
            },
        });
        accountsItemId = accountsItem === null || accountsItem === void 0 ? void 0 : accountsItem.id;
    }
    else if (payload.partyType === 'VENDOR') {
        const accountsItem = yield prisma_1.default.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "accounts receivable"
                },
            },
        });
        accountsItemId = accountsItem === null || accountsItem === void 0 ? void 0 : accountsItem.id;
    }
    if (!accountsItemId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Accounts Item not found");
    }
    const result = yield prisma_1.default.journal.findMany({
        where: {
            accountsItemId: accountsItemId,
            transactionInfo: {
                partyId: party.id,
            },
            date: {
                gte: startDate ? new Date(startDate) : party.openingDate || new Date(),
                lte: endDate ? new Date(endDate) : new Date(),
            },
        },
        orderBy: {
            date: "asc",
        },
        select: {
            transactionInfo: {
                select: {
                    id: true,
                    voucherNo: true,
                    invoiceNo: true,
                    partyId: true,
                    voucherType: true,
                },
            },
            accountsItemId: true,
            date: true,
            creditAmount: true,
            debitAmount: true,
            narration: true,
        },
    });
    return { party, result };
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
        const total = yield prisma_1.default.inventory.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true,
                quantityAdd: true,
                quantityLess: true,
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
        });
        return { rawMaterial, total };
    })));
    return result;
});
const getRawReportById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const rawMaterial = yield prisma_1.default.rawMaterial.findUnique({
        where: {
            id: id,
        },
    });
    if (!rawMaterial) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Raw Material not found");
    }
    const report = yield prisma_1.default.inventory.findMany({
        where: {
            rawId: rawMaterial.id,
            date: {
                gte: rawMaterial.openingDate || new Date((payload === null || payload === void 0 ? void 0 : payload.startDate) || ""),
                lte: new Date((payload === null || payload === void 0 ? void 0 : payload.endDate) || new Date())
            }
        },
        select: {
            transactionInfo: {
                select: {
                    id: true,
                    voucherNo: true,
                    voucherType: true,
                },
            },
        }
    });
    return { rawMaterial, report };
});
const productReport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const allProduct = yield prisma_1.default.product.findMany({
        where: {
            isDeleted: false
        },
    });
    if (allProduct.length < 1) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Product not found");
    }
    const result = Promise.all(allProduct.map((product) => __awaiter(void 0, void 0, void 0, function* () {
        const total = yield prisma_1.default.inventory.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true,
                quantityAdd: true,
                quantityLess: true,
            },
            where: {
                AND: [
                    {
                        productId: product.id
                    },
                    {
                        date: {
                            gte: product.openingDate || new Date((payload === null || payload === void 0 ? void 0 : payload.startDate) || ""),
                            lte: new Date((payload === null || payload === void 0 ? void 0 : payload.endDate) || new Date())
                        }
                    }
                ]
            },
        });
        return { product, total };
    })));
    return result;
});
const getProductReportById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.default.product.findUnique({
        where: {
            id: id,
        },
    });
    if (!product) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Product not found");
    }
    const report = yield prisma_1.default.inventory.findMany({
        where: {
            productId: product.id,
            date: {
                gte: product.openingDate || new Date((payload === null || payload === void 0 ? void 0 : payload.startDate) || ""),
                lte: new Date((payload === null || payload === void 0 ? void 0 : payload.endDate) || new Date())
            }
        },
    });
    return { product, report };
});
exports.ReportService = {
    getAccountLedgerReport,
    partyLedgerReport,
    rawReport,
    getRawReportById,
    productReport,
    getProductReportById,
};
