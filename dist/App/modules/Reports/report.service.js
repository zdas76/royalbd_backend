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
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : undefined;
    if (start && end) {
        const result = yield prisma_1.default.journal.findMany({
            where: {
                accountsItemId: accountsItemId,
                date: {
                    gte: start,
                    lte: end,
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
    if (payload.partyType === 'PARTY') {
        const accountsItem = yield prisma_1.default.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "accounts receivable",
                },
            },
        });
        accountsItemId = accountsItem === null || accountsItem === void 0 ? void 0 : accountsItem.id;
    }
    else if (payload.partyType === 'VENDOR') {
        const accountsItems = yield prisma_1.default.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "accounts payable",
                },
            },
        });
        accountsItemId = accountsItems === null || accountsItems === void 0 ? void 0 : accountsItems.id;
    }
    if (!accountsItemId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Accounts Item not found");
    }
    const result = yield prisma_1.default.journal.findMany({
        where: {
            transactionInfo: {
                partyId: party.id,
            },
            accountsItemId: accountsItemId,
            date: {
                gte: startDate ? new Date(startDate) : (party.openingDate || new Date()),
                lte: endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : new Date(),
            },
        },
        include: {
            transactionInfo: {
                select: {
                    voucherNo: true,
                    partyId: true,
                    voucherType: true,
                },
            },
        },
        orderBy: {
            date: "asc",
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
        const startDate = (payload === null || payload === void 0 ? void 0 : payload.startDate) ? payload === null || payload === void 0 ? void 0 : payload.startDate : rawMaterial === null || rawMaterial === void 0 ? void 0 : rawMaterial.openingDate;
        const endDate = (payload === null || payload === void 0 ? void 0 : payload.endDate) ? payload === null || payload === void 0 ? void 0 : payload.endDate : new Date();
        console.log(startDate, endDate);
        const total = yield prisma_1.default.inventory.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true,
                quantityAdd: true,
                quantityLess: true,
            },
            where: {
                rawId: rawMaterial.id,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
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
    const startDate = (payload === null || payload === void 0 ? void 0 : payload.startDate) ? payload === null || payload === void 0 ? void 0 : payload.startDate : rawMaterial === null || rawMaterial === void 0 ? void 0 : rawMaterial.openingDate;
    const endDate = (payload === null || payload === void 0 ? void 0 : payload.endDate) ? payload === null || payload === void 0 ? void 0 : payload.endDate : new Date();
    const report = yield prisma_1.default.inventory.findMany({
        where: {
            rawId: rawMaterial.id,
            date: {
                gte: new Date(startDate),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        },
        include: {
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
        const startDate = (payload === null || payload === void 0 ? void 0 : payload.startDate) ? payload === null || payload === void 0 ? void 0 : payload.startDate : (product === null || product === void 0 ? void 0 : product.openingDate) || "";
        const endDate = (payload === null || payload === void 0 ? void 0 : payload.endDate) ? payload === null || payload === void 0 ? void 0 : payload.endDate : new Date();
        const total = yield prisma_1.default.inventory.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true,
                quantityAdd: true,
                quantityLess: true,
            },
            where: {
                productId: product.id,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
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
                lte: (payload === null || payload === void 0 ? void 0 : payload.endDate) ? new Date(new Date(payload.endDate).setHours(23, 59, 59, 999)) : new Date()
            }
        },
    });
    return { product, report };
});
const getBalanceSheet = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const targetDate = date ? new Date(new Date(date).setHours(23, 59, 59, 999)) : new Date();
    // Helper to get total debit/credit for an account name up to the target date
    const getAccountBalance = (accountNameContains) => __awaiter(void 0, void 0, void 0, function* () {
        const account = yield prisma_1.default.accountsItem.findFirst({
            where: { accountsItemName: { contains: accountNameContains } },
        });
        if (!account)
            return { debit: 0, credit: 0, accountId: 0 };
        const result = yield prisma_1.default.journal.aggregate({
            _sum: {
                debitAmount: true,
                creditAmount: true,
            },
            where: {
                accountsItemId: account.id,
                date: {
                    lte: targetDate,
                },
            },
        });
        const debit = result._sum.debitAmount || 0;
        const credit = result._sum.creditAmount || 0;
        // Most asset accounts: Debit - Credit
        // Most liability accounts: Credit - Debit
        return { debit, credit, accountId: account.id };
    });
    // 1. Assets
    // Cash in Hand (Asset: Debit - Credit)
    const cashInHandData = yield getAccountBalance("cash in hand");
    const cashInHand = cashInHandData.debit - cashInHandData.credit;
    // Cash at Bank (Asset: Debit - Credit)
    const cashAtBankData = yield getAccountBalance("cash at bank");
    let cashAtBank = cashAtBankData.debit - cashAtBankData.credit;
    // If "cash at bank" isn't a single account, we can alternatively aggregate BankTransaction
    const bankTransactions = yield prisma_1.default.bankTransaction.aggregate({
        _sum: {
            debitAmount: true,
            creditAmount: true,
        },
        where: {
            date: { lte: targetDate },
        },
    });
    const bankBalance = (bankTransactions._sum.debitAmount || 0) - (bankTransactions._sum.creditAmount || 0);
    // Prefer ledger balance, fallback to bank transactions logic depending on system usage
    if (!cashAtBankData.accountId) {
        cashAtBank = bankBalance;
    }
    // Accounts Receivable (Asset: Debit - Credit)
    const accountsReceivableData = yield getAccountBalance("accounts receivable");
    const accountsReceivable = accountsReceivableData.debit - accountsReceivableData.credit;
    // Closing Stock / Inventory (Asset: value of stock)
    // Value = (quantityAdd * unitPrice) - (quantityLess * unitPrice)
    const inventoryData = yield prisma_1.default.inventory.findMany({
        where: {
            date: { lte: targetDate },
            status: "ACTIVE"
        },
    });
    let closingStock = 0;
    for (const inv of inventoryData) {
        const qtyAdded = inv.quantityAdd || 0;
        const qtyLess = inv.quantityLess || 0;
        const price = inv.unitPrice || 0;
        // We assume unitPrice is the value per unit for both addition and deduction
        closingStock += (qtyAdded * price) - (qtyLess * price);
    }
    // Fallback if inventory logic is simpler in aggregate
    const inventoryAggregate = yield prisma_1.default.inventory.aggregate({
        _sum: {
            debitAmount: true,
            creditAmount: true,
        },
        where: { date: { lte: targetDate } }
    });
    // If the system tracks stock value via debit/credit in Inventory
    const inventoryValueViaLedger = (inventoryAggregate._sum.debitAmount || 0) - (inventoryAggregate._sum.creditAmount || 0);
    if (closingStock === 0 && inventoryValueViaLedger !== 0) {
        closingStock = inventoryValueViaLedger;
    }
    const totalAssets = cashInHand + cashAtBank + accountsReceivable + closingStock;
    // 2. Liabilities
    // Accounts Payable (Liability: Credit - Debit)
    const accountsPayableData = yield getAccountBalance("accounts payable");
    const accountsPayable = accountsPayableData.credit - accountsPayableData.debit;
    const totalLiabilities = accountsPayable;
    // 3. Equity
    // Simplest equity formula: Equity = Assets - Liabilities
    // Alternatively, query a "Capital" account
    const capitalData = yield getAccountBalance("capital");
    let equity = capitalData.credit - capitalData.debit;
    if (equity === 0) {
        equity = totalAssets - totalLiabilities;
    }
    return {
        asOfDate: targetDate,
        assets: {
            cashInHand,
            cashAtBank,
            accountsReceivable,
            closingStock,
        },
        liabilities: {
            accountsPayable,
        },
        equity: {
            calculateEquity: totalAssets - totalLiabilities,
            capitalAccount: capitalData.credit - capitalData.debit,
            totalEquity: equity
        },
        totals: {
            totalAssets,
            totalLiabilities,
        }
    };
});
exports.ReportService = {
    getAccountLedgerReport,
    partyLedgerReport,
    rawReport,
    getRawReportById,
    productReport,
    getProductReportById,
    getBalanceSheet,
};
