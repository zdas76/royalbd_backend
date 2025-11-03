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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../../config"));
const creatUserToDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    req.body.photo = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename;
    console.log(req.body);
    const hashedPassword = bcryptjs_1.default.hashSync(req.body.password, parseInt(config_1.default.hash_round));
    const createUser = yield prisma_1.default.user.create({
        data: {
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            photo: req.body.photo,
            mobile: req.body.mobile,
        },
    });
    return createUser;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        where: {
            status: client_1.Status.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            mobile: true,
            status: true,
        },
    });
    return result;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findFirst({
        where: {
            id: id,
            status: client_1.Status.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            name: true,
            photo: true,
            mobile: true,
            status: true,
        },
    });
    return result;
});
const updateUserById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
            status: client_1.Status.ACTIVE,
        },
        data: payload,
    });
    return result;
});
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
            status: client_1.Status.ACTIVE,
        },
        data: {
            status: client_1.Status.DELETED,
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
