
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { date } from "zod";
import { TBankAccount } from "./bank.types";
import { BankAccount } from "../../../../generated/prisma";

const createBankAccount = async (payload: TBankAccount) => {
  //check account number isExisted
  const accountExisted = await prisma.bankAccount.findFirst({
    where: {
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
    },
  });

  if (accountExisted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This account already existed");
  }

  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.bankAccount.create({
      data: {
        bankName: payload.bankName,
        branceName: payload.branceName,
        accountNumber: payload.accountNumber,
      },
    });

    await tx.bankTransaction.create({
      data: {
        bankAccountId: result.id,
        date: new Date(payload.date),
        debitAmount: payload.initalAmount,
        isClosing: true,
      },
    });
  });
  return result;
};

const getAllBankAccount = async () => {
  const result = await prisma.bankAccount.findMany({});

  return result;
};

const getBankAccountById = async (id: number) => {
  const result = await prisma.bankAccount.findFirst({
    where: { id },
  });

  return result;
};

const updateAccountInfo = async (id: number, payload: Partial<BankAccount>) => {
  //check account number isExisted
  const accountExisted = await prisma.bankAccount.findFirst({
    where: { id },
  });

  if (!accountExisted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Account Found");
  }

  const result = await prisma.bankAccount.update({
    where: { id },
    data: payload,
  });

  return result;
};

const getBankLedger = async (
  accountId: number,
  fromDate?: string,
  toDate?: string,
) => {
  const accountIdObj = await prisma.bankAccount.findFirst({
    where: { id: accountId },
  });
  if (!accountIdObj) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Account Found");
  }

  // Parse dates only if provided
  const fromDateObj = fromDate ? new Date(fromDate) : undefined;
  const toDateObj = toDate ? new Date(toDate) : undefined;

  if (fromDateObj && isNaN(fromDateObj.getTime())) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid fromDate format");
  }
  if (toDateObj && isNaN(toDateObj.getTime())) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid toDate format");
  }

  // Adjust toDate to include the whole day
  if (toDateObj) {
    toDateObj.setHours(23, 59, 59, 999);
  }
  // Build date filter conditionally
  const dateFilter: any = {};
  if (fromDateObj) dateFilter.gte = fromDateObj;
  if (toDateObj) dateFilter.lte = toDateObj;

  // Get initial balance (sum of all transactions before fromDate)
  const initialBalance = await prisma.bankTransaction.aggregate({
    _sum: {
      debitAmount: true,
      creditAmount: true
    },
    where: {
      bankAccountId: accountId,
      ...(fromDateObj ? { date: { lt: fromDateObj } } : {}),
    },
  });
  // Get all transactions (with optional date range)
  const transactions = await prisma.bankTransaction.findMany({
    where: {
      bankAccountId: accountId,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
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
    return {
      ...t,
      balance,
    };
  });

  return {
    accountId,
    fromDate: fromDateObj ? fromDateObj.toISOString().split("T")[0] : null,
    toDate: toDateObj ? toDateObj.toISOString().split("T")[0] : null,
    initialBalance: (initialBalance._sum.debitAmount || 0) - (initialBalance._sum.creditAmount || 0),
    transactions: ledgerTransactions,
    closingBalance: ledgerBalance,
    accountIdObj
  };
};



export const BankAccountService = {
  createBankAccount,
  getAllBankAccount,
  getBankAccountById,
  updateAccountInfo,
  getBankLedger,
};
