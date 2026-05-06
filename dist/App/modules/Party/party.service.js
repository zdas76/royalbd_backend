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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const http_status_codes_1 = require("http-status-codes");
const paginationHelpers_1 = require("../../../helpars/paginationHelpers");
const party_constant_1 = require("./party.constant");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_2 = require("../../../../generated/prisma");
const getPertyLedgerInfo = (params, paginat) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelpers_1.paginationHelper.Pagination(paginat);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (params.searchTerm) {
        andCondition.push({
            OR: [
                {
                    party: {
                        partyType: params === null || params === void 0 ? void 0 : params.partyType,
                    },
                },
                {
                    voucherNo: {
                        contains: params.searchTerm,
                    },
                },
                {
                    party: {
                        name: {
                            contains: params.searchTerm,
                        },
                    },
                },
            ],
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData)
            .map((key) => {
            if (key === "partyType") {
                // Handle the invalid "PARTY" value from the error report if necessary
                // or just ensure it's a valid enum value for the related Party model
                return {
                    party: {
                        partyType: filterData[key] === "PARTY" ? undefined : filterData[key],
                    },
                };
            }
            return {
                [key]: {
                    equals: filterData[key],
                },
            };
        })
            .filter((condition) => Object.values(condition)[0] !== undefined);
        if (filterConditions.length > 0) {
            andCondition.push({
                AND: filterConditions,
            });
        }
    }
    const whereConditions = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.transactionInfo.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: paginat.sortBy && paginat.sortOrder
            ? {
                [paginat.sortBy]: paginat.sortOrder,
            }
            : {
                createdAt: "desc",
            },
    });
    return result;
});
const createParty = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.party.findFirst({
        where: {
            name: payload.name,
            contactNo: payload.contactNo,
            partyType: payload.partyType,
            isDeleted: false,
        },
    });
    if (isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "This User Already Exist");
    }
    const crateParty = yield prisma_1.default.party.create({
        data: {
            name: payload.name,
            contactNo: payload.contactNo,
            address: payload.address,
            partyType: payload.partyType,
        },
    });
    return crateParty;
});
const getAllParty = (params, paginat) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelpers_1.paginationHelper.Pagination(paginat);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (params.searchTerm) {
        andCondition.push({
            OR: party_constant_1.PartySearchAbleFields.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                },
            })),
        });
    }
    if (params === null || params === void 0 ? void 0 : params.partyType) {
        andCondition.push({
            partyType: params.partyType,
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => {
            if (key === "partyType") {
                return {
                    [key]: {
                        equals: filterData[key] === prisma_2.PartyType.PARTY ? undefined : filterData[key],
                    },
                };
            }
            return {
                [key]: {
                    equals: filterData[key],
                },
            };
        }).filter(condition => Object.values(condition)[0].equals !== undefined);
        if (filterConditions.length > 0) {
            andCondition.push({
                AND: filterConditions,
            });
        }
    }
    const whereConditions = andCondition.length > 0 ? { AND: andCondition } : { isDeleted: false };
    const result = yield prisma_1.default.party.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: paginat.sortBy && paginat.sortOrder
            ? {
                [paginat.sortBy]: paginat.sortOrder,
            }
            : {
                createdAt: "desc",
            },
    });
    return result;
});
const getPartyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.party.findFirst({
        where: {
            id: id,
        },
    });
    return result;
});
const updatePartyById = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.party.findFirst({
        where: {
            id: id,
            isDeleted: false,
        },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Party Found ");
    }
    const result = yield prisma_1.default.party.update({
        where: {
            id: id,
        },
        data: payload,
    });
    return result;
});
const deletePartyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.party.findFirst({
        where: {
            id: id,
            isDeleted: false,
        },
    });
    if (!isExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No party found");
    }
    const result = yield prisma_1.default.party.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true,
        },
    });
    return result;
});
exports.PartyService = {
    getPertyLedgerInfo,
    createParty,
    getAllParty,
    getPartyById,
    updatePartyById,
    deletePartyById,
};
