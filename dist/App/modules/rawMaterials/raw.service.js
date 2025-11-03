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
exports.RowMaterialsService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const createRawMaterial = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rawMaterial.findFirst({
        where: {
            name: payload === null || payload === void 0 ? void 0 : payload.name,
        },
    });
    if (isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "This name is already used");
    }
    const rawMeterial = yield prisma_1.default.rawMaterial.create({
        data: {
            name: payload.name,
            description: payload.description,
            unitId: payload.unitId,
            openingDate: new Date(payload.date),
            unitPrice: payload.unitPrice,
            quantity: payload.quantity,
            amount: payload.amount,
            inventory: {
                create: {
                    date: new Date(payload.date),
                    unitPrice: payload.unitPrice,
                    quantityAdd: payload.quantity,
                    debitAmount: payload.amount,
                    isClosing: true,
                },
            },
        },
    });
    return rawMeterial;
});
const getAllRawMaterial = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rawMaterial.findMany({
        include: {
            unit: true,
        },
    });
    return result;
});
const getRawMaterialById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.rawMaterial.findFirst({
        where: {
            id: id,
            isDeleted: false,
        },
    });
    return result;
});
const updateRawMaterial = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rawMaterial.findFirst({
        where: { id },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No material found");
    }
    const result = yield prisma_1.default.rawMaterial.update({
        where: {
            id,
        },
        data: {
            name: payload.name,
            unitId: payload.unitId,
            description: payload.description,
        },
    });
    return result;
});
const deleteRawMaterial = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.rawMaterial.findFirst({
        where: {
            id,
        },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No material found");
    }
    const result = yield prisma_1.default.rawMaterial.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
});
const createLogtoRaw = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const convertLog = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const inventoryData = payload === null || payload === void 0 ? void 0 : payload.items.map((item) => ({
            rawId: item.rawId,
            unitPrice: item.amount / item.quantity,
            quantityAdd: item.quantity,
            date: payload.date,
            journal: {
                create: {
                    debitAmount: item.amount,
                    narration: "Log converted to raw material",
                    date: payload.date,
                },
            },
        }));
        const logCategoryData = payload === null || payload === void 0 ? void 0 : payload.items.map((item) => ({
            logCategoryId: item.logCategoryId,
            unitPrice: item.amount / item.quantity,
            quantityLess: item.quantity,
            date: payload.date,
            creditAmount: item.amount,
        }));
        const result = yield prisma_1.default.logToRaw.create({
            data: {
                voucherNo: payload.voucherNo,
                date: payload.date,
                inventory: {
                    create: inventoryData,
                },
                logOrdByCategory: {
                    create: logCategoryData,
                },
            },
        });
        return result;
    }));
});
exports.RowMaterialsService = {
    createRawMaterial,
    getAllRawMaterial,
    getRawMaterialById,
    updateRawMaterial,
    deleteRawMaterial,
    createLogtoRaw,
};
