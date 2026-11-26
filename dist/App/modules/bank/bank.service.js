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
exports.BankAccountService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const createBankAccount = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //check account number isExisted
    const accountExisted = yield prisma_1.default.bankAccount.findFirst({
        where: {
            bankName: payload.bankName,
            accountNumber: payload.accountNumber,
        },
    });
    if (accountExisted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "This account already existed");
    }
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield tx.bankAccount.create({
            data: {
                bankName: payload.bankName,
                branceName: payload.branceName,
                accountNumber: payload.accountNumber,
            },
        });
        yield tx.bankTransaction.create({
            data: {
                bankAccountId: result.id,
                date: new Date(payload.date),
                debitAmount: payload.initalAmount,
                isClosing: true,
            },
        });
    }));
    return result;
});
const getAllBankAccount = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.bankAccount.findMany({});
    return result;
});
const getBankAccountById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.bankAccount.findFirst({
        where: { id },
    });
    return result;
});
const updateAccountInfo = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    //check account number isExisted
    const accountExisted = yield prisma_1.default.bankAccount.findFirst({
        where: { id },
    });
    if (!accountExisted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Account Found");
    }
    const result = yield prisma_1.default.bankAccount.update({
        where: { id },
        data: payload,
    });
    return result;
});
const getBankLedger = (accountId, fromDate, toDate) => __awaiter(void 0, void 0, void 0, function* () {
    const accountIdObj = yield prisma_1.default.bankAccount.findFirst({
        where: { id: accountId },
    });
    if (!accountIdObj) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Account Found");
    }
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    // Adjust toDate to include the whole day
    toDateObj.setHours(23, 59, 59, 999);
    // Get initial balance (sum of all previous debit transactions)
    const initialBalance = yield prisma_1.default.bankTransaction.aggregate({
        _sum: {
            debitAmount: true,
            creditAmount: true
        },
        where: {
            bankAccountId: accountId,
            date: {
                lt: fromDateObj,
            },
        },
    });
    // Get all transactions within the date range
    const transactions = yield prisma_1.default.bankTransaction.findMany({
        where: {
            bankAccountId: accountId,
            date: {
                gte: fromDateObj,
                lte: toDateObj,
            },
        },
        orderBy: {
            date: "asc",
        },
    });
    // Calculate ledger balance
    let ledgerBalance = (initialBalance._sum.debitAmount || 0) - (initialBalance._sum.creditAmount || 0);
    const ledgerTransactions = transactions.map((t) => {
        const balance = ledgerBalance + (t.debitAmount || 0) - (t.creditAmount || 0);
        ledgerBalance = balance;
        return Object.assign(Object.assign({}, t), { balance });
    });
    return {
        accountId,
        fromDate: fromDateObj.toISOString().split("T")[0],
        toDate: toDateObj.toISOString().split("T")[0],
        initialBalance: (initialBalance._sum.debitAmount || 0) - (initialBalance._sum.creditAmount || 0),
        transactions: ledgerTransactions,
        closingBalance: ledgerBalance,
        accountIdObj
    };
});
exports.BankAccountService = {
    createBankAccount,
    getAllBankAccount,
    getBankAccountById,
    updateAccountInfo,
    getBankLedger,
};
