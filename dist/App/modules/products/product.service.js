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
exports.ProductService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {

    const isExist = yield prisma_1.default.product.findFirst({
        where: {
            name: payload.name,
            isDeleted: false,
        },
    });
    if (isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "This product is already existed");
    }
    const result = yield prisma_1.default.product.create({
        data: {
            name: payload.name,
            description: payload.description,
            unitId: payload.unitId,
            subCategoryId: payload.subCategoryId,
            minPrice: payload.minPrice || 0,
            size: payload.size || "",
            openingDate: payload.initialStock.date,
            amount: Number(payload.initialStock.amount),
            quantity: payload.initialStock.quantity,
            unitPrice: payload.initialStock.unitPrice,
            inventory: {
                create: {
                    date: payload.initialStock.date,
                    unitPrice: payload.initialStock.unitPrice,
                    quantityAdd: payload.initialStock.quantity,
                    debitAmount: Number(payload.initialStock.amount),
                    isClosing: true,
                },
            },
        },
    });
    return result;
});
const gerProduct = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.product.findMany({
        include: {
            unit: {
                select: {
                    name: true,
                },
            },
            subCategory: {
                select: {
                    subCategoryName: true,
                },
            },
        },
    });
    return result;
});
const gerProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.product.findFirst({
        where: {
            id: id,
        },
    });
    return result;
});
const updateProductById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.product.findFirst({
        where: { id: id },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No product found");
    }
    const result = yield prisma_1.default.product.update({
        where: {
            id: id,
        },
        data: {
            name: payload.name,
            description: payload.description,
            unitId: payload.unitId,
            subCategoryId: payload.subCategoryId,
            minPrice: payload.minPrice || 0,
            size: payload.size || "",
        },
    });
    return result;
});
const deleteProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.product.findFirst({
        where: { id: id },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No product found");
    }
    const result = yield prisma_1.default.product.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
});
exports.ProductService = {
    createProduct,
    gerProduct,
    gerProductById,
    updateProductById,
    deleteProductById,
};
