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
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../../config"));
const prisma_2 = require("../../../../generated/prisma");
const creatUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = bcryptjs_1.default.hashSync(payload.password, parseInt(config_1.default.hash_round));
    const createUser = yield prisma_1.default.user.create({
        data: {
            email: payload.email,
            password: hashedPassword,
            name: payload.name,
            phone: payload.phone,
        },
    });
    return createUser;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        where: {
            status: prisma_2.Status.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
        },
    });
    return result;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findFirst({
        where: {
            id: id,
            status: prisma_2.Status.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
        },
    });
    return result;
});
const updateUserById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
            status: prisma_2.Status.ACTIVE,
        },
        data: payload,
    });
    return result;
});
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
            status: prisma_2.Status.ACTIVE,
        },
        data: {
            status: prisma_2.Status.DELETED,
        },
    });
    return result;
});
exports.UserService = {
    creatUserToDB,
    getAllUser,
    getUserById,
    updateUserById,
    deleteUserById,
};
