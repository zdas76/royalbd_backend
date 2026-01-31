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
exports.JurnalService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const prisma_2 = require("../../../../generated/prisma");
//Create Purchase Received Voucher
const createPurchestReceivedIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createPurchestVoucher = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const partyExists = yield tx.party.findUnique({
            where: { id: payload.partyOrcustomerId },
        });
        if (!partyExists) {
            throw new Error(`Invalid partyOrcustomerId: ${payload.partyOrcustomerId}. No matching Party found.`);
        }
        // step 1. create transaction entries
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                invoiceNo: payload.invoiceNo || null,
                voucherNo: payload.voucherNo,
                date: payload.date,
                voucherType: prisma_2.VoucherType.PURCHASE,
                partyId: partyExists.id,
            },
        });
        // 2. create bank transaction
        const BankTXData = [];
        payload.creditItem.forEach((item) => {
            if (item.bankId !== null) {
                BankTXData.push({
                    transectionId: createTransactionInfo.id,
                    bankAccountId: item.bankId,
                    date: payload.date,
                    creditAmount: item.amount,
                });
            }
        });
        if (BankTXData.length > 0) {
            yield tx.bankTransaction.createMany({
                data: BankTXData,
            });
        }
        if (!Array.isArray(payload.items) || payload.items.length === 0) {
            throw new Error("Invalid data: items must be a non-empty array");
        }
        //step 3: Prepare Inventory Data
        const inventoryData = payload.items.map((item) => {
            if (item.itemType === "RAW_MATERIAL") {
                return {
                    transactionId: createTransactionInfo.id,
                    date: payload.date,
                    rawId: item.rawOrProductId,
                    unitPrice: item.unitPrice || 0,
                    quantityAdd: item.quantityAdd || 0,
                    discount: (item === null || item === void 0 ? void 0 : item.discount) || 0,
                    debitAmount: item.debitAmount,
                };
            }
            else {
                return {
                    transactionId: createTransactionInfo.id,
                    productId: item.rawOrProductId,
                    unitPrice: item.unitPrice || 0,
                    quantityAdd: item.quantityAdd || 0,
                    discount: (item === null || item === void 0 ? void 0 : item.discount) || 0,
                    date: payload.date,
                    debitAmount: item.debitAmount,
                };
            }
        });
        //Step 3: Insert Inventory Records
        yield Promise.all(inventoryData.map((item) => tx.inventory.create({
            data: item,
        })));
        let journalItem = [];
        // Step 7: Prepare Journal Credit Entries (For Payment Accounts)
        payload.creditItem.forEach((item) => {
            var _a;
            return journalItem.push({
                transectionId: createTransactionInfo.id,
                accountsItemId: Number(item.accountsItemId),
                creditAmount: Number(item.amount),
                narration: (_a = item.narration) !== null && _a !== void 0 ? _a : "",
                date: new Date(payload.date),
            });
        });
        const debiteAccountsId = yield tx.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "inventory"
                },
            },
        });
        if (!debiteAccountsId) {
            throw new Error("Invalid Accounts Item ");
        }
        journalItem.push({
            transectionId: createTransactionInfo.id,
            accountsItemId: debiteAccountsId.id,
            debitAmount: payload.grandTotal,
            narration: "Purchase Inventory Received",
            date: new Date(payload.date),
        });
        const debitAmount = journalItem.reduce((total, item) => total + (Number(item.debitAmount) || 0), 0);
        const creditAmount = journalItem.reduce((total, item) => total + (Number(item.creditAmount) || 0), 0);
        if (debitAmount !== creditAmount) {
            throw new Error("Debit and Credit amounts do not match");
        }
        //Step 8: Insert Journal Records
        yield tx.journal.createMany({
            data: journalItem,
        });
        return createTransactionInfo;
    }));
    return createPurchestVoucher;
});
// create Salse Voucher
const createSalesVoucher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createSalseVoucher = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        let isCustomer = null;
        if (payload.partyType === "CUSTOMER") {
            const customerExists = yield tx.customer.findFirst({
                where: { contactNumber: payload === null || payload === void 0 ? void 0 : payload.contactNumber },
            });
            if (customerExists) {
                isCustomer = customerExists;
            }
            else {
                isCustomer = yield tx.customer.create({
                    data: {
                        name: payload.name || "",
                        contactNumber: payload.contactNumber,
                        address: payload.address || "",
                    },
                });
            }
        }
        let isParty = null;
        if (payload.partyType === "VENDOR") {
            isParty = yield tx.party.findFirst({
                where: {
                    id: payload.partyOrcustomerId,
                    isDeleted: false,
                },
            });
            if (!isParty) {
                throw new Error(`Invalid Vendor`);
            }
        }
        // step 1. create transaction entries
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                voucherNo: payload.voucherNo,
                voucherType: prisma_2.VoucherType.SALES,
                partyId: (isParty === null || isParty === void 0 ? void 0 : isParty.id) || null,
                customerId: (isCustomer === null || isCustomer === void 0 ? void 0 : isCustomer.id) || null,
                date: payload.date,
            },
        });
        // 2. create bank transaction
        const BankTXData = [];
        for (const item of payload.debitItem) {
            if (item.bankAccountId) {
                BankTXData.push({
                    transectionId: createTransactionInfo.id,
                    bankAccountId: item.bankAccountId,
                    date: payload.date,
                    debitAmount: item === null || item === void 0 ? void 0 : item.debitAmount,
                });
            }
        }
        if (BankTXData && BankTXData.length > 0) {
            yield tx.bankTransaction.createMany({
                data: BankTXData,
            });
        }
        if (!Array.isArray(payload.salseItem) || payload.salseItem.length === 0) {
            throw new Error("Invalid data: salseItem must be a non-empty array");
        }
        // step 2: prepiar inventory data
        const inventoryData = payload.salseItem.map((item) => ({
            transactionId: createTransactionInfo.id,
            productId: item.rawOrProductId,
            date: payload.date,
            unitPrice: item.unitPrice || 0,
            quantityLess: item.quantity || 0,
            discount: item.discount || 0,
            creditAmount: item.creditAmount,
        }));
        //Step 3: Insert Inventory Records
        yield Promise.all(inventoryData.map((item) => tx.inventory.create({
            data: item,
        })));
        if (!Array.isArray(payload.debitItem) || payload.debitItem.length === 0) {
            throw new Error("Invalid data: items must be a non-empty array");
        }
        let journalItems = [];
        payload.debitItem.map((item) => journalItems.push({
            transectionId: createTransactionInfo.id,
            accountsItemId: item.accountsItemId,
            date: payload.date,
            debitAmount: item.debitAmount,
            narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
        }));
        if (payload.totalDiscount && payload.totalDiscount > 0) {
            const discountItem = yield tx.accountsItem.findFirst({
                where: {
                    accountsItemName: {
                        contains: "discount",
                    },
                },
            });
            if (payload.totalDiscount && discountItem) {
                journalItems.push({
                    transectionId: createTransactionInfo.id,
                    accountsItemId: parseInt(discountItem.id),
                    debitAmount: payload.totalDiscount,
                    narration: "Discount",
                    date: payload.date,
                });
            }
        }
        const debiteAccountsId = yield tx.accountsItem.findFirst({
            where: {
                accountsItemName: {
                    contains: "inventory"
                },
            },
        });
        if (!debiteAccountsId) {
            throw new Error("Invalid Accounts Item inventory");
        }
        journalItems.push({
            transectionId: createTransactionInfo.id,
            accountsItemId: debiteAccountsId.id,
            debitAmount: payload.grandTotal,
            narration: "Purchase Inventory Received",
            date: new Date(payload.date),
        });
        const debitAmount = journalItems.reduce((total, item) => total + (Number(item.debitAmount) || 0), 0);
        const creditAmount = journalItems.reduce((total, item) => total + (Number(item.creditAmount) || 0), 0);
        if (debitAmount !== creditAmount) {
            throw new Error("Debit and Credit amounts do not match");
        }
        yield tx.journal.createMany({
            data: journalItems,
        });
        return createTransactionInfo;
    }));
    return createSalseVoucher;
});
// Create Payment Voucher
const createPaymentVoucher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createVoucher = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        let isParty = null;
        if (payload.partyType === "VENDOR" || "SUPPLIER") {
            isParty = yield tx.party.findFirst({
                where: {
                    id: payload.partyId,
                    isDeleted: false,
                },
            });
            if (!isParty) {
                throw new Error(`Invalid partyId: ${payload.partyOrcustomerId}. No matching Party or Customer found.`);
            }
        }
        // Create Transaction Voucher
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                voucherNo: payload.voucherNo,
                voucherType: prisma_2.VoucherType.PAYMENT,
                partyId: (isParty === null || isParty === void 0 ? void 0 : isParty.id) || null,
                date: payload.date,
            },
        });
        // 2. create bank transaction
        const BankTXData = [];
        payload.creditItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (item.bankAccountId) {
                BankTXData.push({
                    transectionId: createTransactionInfo.id,
                    bankAccountId: item.bankAccountId,
                    date: payload.date,
                    creditAmount: Number(item.amount),
                });
            }
        }));
        if (BankTXData && BankTXData.length > 0) {
            yield tx.bankTransaction.createMany({
                data: BankTXData,
            });
        }
        if (!Array.isArray(payload.creditItem) || payload.creditItem.length === 0) {
            throw new Error("Invalid data: salseItem must be a non-empty array");
        }
        const journalCreditItems = [];
        payload.creditItem.map((item) => {
            journalCreditItems.push({
                transectionId: createTransactionInfo.id,
                accountsItemId: item.accountsItemId,
                date: payload.date,
                creditAmount: Number(item.amount),
                narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
            });
        });
        if (!Array.isArray(payload.debitItem) || payload.debitItem.length === 0) {
            throw new Error("Invalid data: Dabite Items must be a non-empty array");
        }
        // Step 7: Prepare Journal Credit Entries (For Payment Accounts)
        const journalDebitItems = payload.debitItem.map((item) => ({
            transectionId: createTransactionInfo.id,
            accountsItemId: item.accountsItemId,
            date: payload.date,
            debitAmount: Number(item.amount),
            narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
        }));
        const journalItems = [...journalDebitItems, ...journalCreditItems];
        yield tx.journal.createMany({
            data: journalItems,
        });
        return createTransactionInfo.id;
    }));
    const result = yield prisma_1.default.transactionInfo.findFirst({
        where: { id: createVoucher },
    });
    return result;
});
const createReceiptVoucher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createVoucher = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        let isParty = null;
        if (payload.partyType === "VENDOR" || "SUPPLIER") {
            isParty = yield tx.party.findFirst({
                where: {
                    id: payload.partyId,
                    isDeleted: false,
                },
            });
            if (!isParty) {
                throw new Error(`Invalid partyId: ${payload.partyOrcustomerId}. No matching Party or Customer found.`);
            }
        }
        // Create Transaction Voucher
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                voucherNo: payload.voucherNo,
                voucherType: prisma_2.VoucherType.RECEIPT,
                partyId: (isParty === null || isParty === void 0 ? void 0 : isParty.id) || null,
                date: payload.date,
            },
        });
        // 2. create bank transaction
        const BankTXData = [];
        payload.debitItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (item.bankAccountId) {
                BankTXData.push({
                    transectionId: createTransactionInfo.id,
                    bankAccountId: item.bankAccountId,
                    date: payload.date,
                    debitAmount: Number(item.amount),
                });
            }
        }));
        if (BankTXData && BankTXData.length > 0) {
            yield tx.bankTransaction.createMany({
                data: BankTXData,
            });
        }
        if (!Array.isArray(payload.debitItem) || payload.debitItem.length === 0) {
            throw new Error("Invalid data: salseItem must be a non-empty array");
        }
        const journalDebitItems = [];
        payload.debitItem.map((item) => {
            if (!item.bankAccountId) {
                journalDebitItems.push({
                    transectionId: createTransactionInfo.id,
                    accountsItemId: item.accountsItemId,
                    date: payload.date,
                    debitAmount: Number(item.amount),
                    narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
                });
            }
        });
        if (!Array.isArray(payload.creditItem) || payload.creditItem.length === 0) {
            throw new Error("Invalid data: salseItem must be a non-empty array");
        }
        // Step 7: Prepare Journal Credit Entries (For Payment Accounts)
        const journalCreditItems = payload.creditItem.map((item) => ({
            transectionId: createTransactionInfo.id,
            accountsItemId: item.accountsItemId,
            creditAmount: Number(item.amount),
            narration: (item === null || item === void 0 ? void 0 : item.narration) || "",
            date: payload.date,
        }));
        const journalItems = [...journalDebitItems, ...journalCreditItems];
        yield tx.journal.createMany({
            data: journalItems,
        });
        return createTransactionInfo.id;
    }));
    const result = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            id: createVoucher,
        },
    });
    return result;
});
const createJournalVoucher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createJournal = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        let partyExists;
        //check party
        if (payload.party) {
            partyExists = yield tx.party.findFirst({
                where: { id: payload.partyId },
            });
        }
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                voucherNo: payload.voucherNo,
                voucherType: prisma_2.VoucherType.JOURNAL,
                date: payload.date,
                partyId: (partyExists === null || partyExists === void 0 ? void 0 : partyExists.id) || null,
            },
        });
        //bank transaction
        let BankTXData;
        if (payload.debitBankId && payload.debitBankId > 0) {
            BankTXData = {
                transectionId: createTransactionInfo.id,
                bankAccountId: payload.debitBankId,
                date: payload.date,
                creditAmount: payload === null || payload === void 0 ? void 0 : payload.amount,
            };
        }
        if (payload.creditBankId && payload.creditBankId > 0) {
            BankTXData = {
                transectionId: createTransactionInfo.id,
                bankAccountId: payload.creditBankId,
                date: payload.date,
                debitAmount: payload === null || payload === void 0 ? void 0 : payload.amount,
            };
        }
        if (BankTXData) {
            yield tx.bankTransaction.create({
                data: BankTXData,
            });
        }
        yield tx.journal.createMany({
            data: [
                {
                    transectionId: createTransactionInfo.id,
                    accountsItemId: payload.creditItem,
                    date: new Date(payload.date),
                    creditAmount: payload.amount,
                    narration: (payload === null || payload === void 0 ? void 0 : payload.narration) || "",
                },
                {
                    transectionId: createTransactionInfo.id,
                    accountsItemId: payload.debitItem,
                    date: new Date(payload.date),
                    debitAmount: payload.amount,
                    narration: (payload === null || payload === void 0 ? void 0 : payload.narration) || "",
                },
            ],
        });
        return createTransactionInfo;
    }));
    const result = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            id: createJournal.id,
        },
    });
    return result;
});
const createQantaVoucher = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const createJournal = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        let partyExists;
        //check party
        if (payload.party) {
            partyExists = yield tx.party.findFirst({
                where: { id: payload.partyId },
            });
        }
        const createTransactionInfo = yield tx.transactionInfo.create({
            data: {
                voucherNo: payload.voucherNo,
                voucherType: prisma_2.VoucherType.JOURNAL,
                partyId: (partyExists === null || partyExists === void 0 ? void 0 : partyExists.id) || null,
                date: payload.date,
            },
        });
        let BankTXData;
        if (payload.debitBankId && payload.debitBankId > 0) {
            BankTXData = {
                transectionId: createTransactionInfo.id,
                bankAccountId: payload.debitBankId,
                date: payload.date,
                debitAmount: payload === null || payload === void 0 ? void 0 : payload.amount,
            };
        }
        if (payload.creditBankId && payload.creditBankId > 0) {
            BankTXData = {
                transectionId: createTransactionInfo.id,
                bankAccountId: payload.creditBankId,
                date: payload.date,
                creditAmount: payload === null || payload === void 0 ? void 0 : payload.amount,
            };
        }
        if (BankTXData) {
            yield tx.bankTransaction.create({
                data: BankTXData,
            });
        }
        yield tx.journal.createMany({
            data: [
                {
                    transectionId: createTransactionInfo.id,
                    accountsItemId: payload.creditItem,
                    date: new Date(payload.date),
                    creditAmount: payload.amount,
                    narration: (payload === null || payload === void 0 ? void 0 : payload.narration) || "",
                },
                {
                    transectionId: createTransactionInfo.id,
                    accountsItemId: payload.debitItem,
                    date: new Date(payload.date),
                    debitAmount: payload.amount,
                    narration: (payload === null || payload === void 0 ? void 0 : payload.narration) || "",
                },
            ],
        });
        return createTransactionInfo;
    }));
    const result = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            id: createJournal.id,
        },
    });
    return result;
});
const getItemTotalByAccountId = (payLoad) => __awaiter(void 0, void 0, void 0, function* () {
    const getDate = yield prisma_1.default.journal.findFirst({
        where: {
            accountsItemId: Number(payLoad.productId),
            isClosing: true,
        },
        orderBy: [{ id: "desc" }],
    });
    const result = yield prisma_1.default.$queryRaw `
  
SELECT 
j.accountsItemId,
 
 SUM(IFNULL(j.debitAmount, 0)- IFNULL(j.creditAmount, 0)) AS netAmount
    
  FROM journals j
  LEFT JOIN transaction_info t ON t.id = j.transectionId
  WHERE j.accountsItemId = ${payLoad.accountsItemId} AND  j.date >= ${(getDate === null || getDate === void 0 ? void 0 : getDate.date) || new Date(payLoad.date)} 
  GROUP BY j.accountsItemId`;
    return result[0];
});
exports.JurnalService = {
    createPurchestReceivedIntoDB,
    createSalesVoucher,
    createPaymentVoucher,
    createReceiptVoucher,
    createJournalVoucher,
    createQantaVoucher,
    getItemTotalByAccountId,
};
