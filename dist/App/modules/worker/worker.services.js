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
exports.workerServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createWorkerDb = (payloed) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.worker.create({
        data: {
            name: payloed.name,
            nid: payloed.nid,
            address: payloed.address,
            phone: payloed.phone,
            workingPlace: payloed.workingPlace,
            dob: payloed.dob,
        }
    });
    return result;
});
const getWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.worker.findMany();
    return result;
});
const getWorkerByIddb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.worker.findUnique({
        where: { id }
    });
    return result;
});
const updateWorkerDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.worker.update({
        where: { id },
        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (payload.name && { name: payload.name })), (payload.nid && { nid: payload.nid })), (payload.address && { address: payload.address })), (payload.phone && { phone: payload.phone })), (payload.workingPlace && { workingPlace: payload.workingPlace })), (payload.dob && { dob: new Date(payload.dob) })),
    });
    return result;
});
const deleteWorkerDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.worker.delete({
        where: { id }
    });
    return result;
});
exports.workerServices = { createWorkerDb, updateWorkerDb, getWorker, deleteWorkerDb, getWorkerByIddb };
