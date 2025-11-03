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
exports.CreateProductServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createProductInfo = (payLoad) => __awaiter(void 0, void 0, void 0, function* () {
    const addProduct = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // create Transaction
        const createTransaction = yield tx.transactionInfo.create({
            data: {
                voucherNo: payLoad.voucherNo,
                voucherType: client_1.VoucherType.CREATEPRODUCT,
            },
        });
        // 2. check product item
        const isProductExisted = yield prisma_1.default.product.findFirst({
            where: {
                id: payLoad.product.productId,
                itemType: client_1.ItemType.PRODUCT,
                isDeleted: false,
            },
        });
        if (!isProductExisted) {
            throw new Error(`Product not found.`);
        }
        const productInventory = {
            productId: isProductExisted.id,
            date: new Date(payLoad.date),
            transactionId: createTransaction.id,
            quantityAdd: payLoad.product.quantity,
            unitPrice: payLoad.product.unitcost,
            debitAmount: payLoad.product.amount,
        };
        // 3. Check Raw Materials
        const isRawMaterialExisted = payLoad.rawMaterials.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            return yield prisma_1.default.product.findFirst({
                where: {
                    id: item.rawMaterialsId,
                    itemType: client_1.ItemType.RAW_MATERIAL,
                    isDeleted: false,
                },
            });
        }));
        if (!isRawMaterialExisted) {
            throw new Error(`Invalid raw material.`);
        }
        const rowMaterialInventory = payLoad.rawMaterials.map((item) => ({
            rawId: item.rawMaterialsId,
            transactionId: createTransaction.id,
            date: new Date(payLoad.date),
            quantityLess: item.quantity,
            unitPrice: item.rawUnitprice,
            creditAmount: item.amount,
        }));
        const InventoryItem = [...rowMaterialInventory, productInventory];
        yield tx.inventory.createMany({
            data: InventoryItem,
        });
        // Step 3: Prepare Journal Credit Entries (For Payment Accounts)
        const costItemsJournal = payLoad.expenses.map((item) => ({
            transectionId: createTransaction.id,
            accountsItemId: item.accountsItemId,
            date: new Date(payLoad.date),
            debitAmount: item.amount,
            narration: item.narration || "",
        }));
        yield tx.journal.createMany({
            data: costItemsJournal,
        });
        return createTransaction;
    }));
    const getCreatedProduct = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            id: addProduct.id,
        },
        include: {
            inventory: true,
            journal: true,
        },
    });
    console.log(getCreatedProduct);
    return getCreatedProduct;
});
exports.CreateProductServices = {
    createProductInfo,
};
