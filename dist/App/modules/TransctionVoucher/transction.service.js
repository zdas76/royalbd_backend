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
exports.VoucherService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const getAllVoucher = () => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield prisma_1.default.transactionInfo.findMany({
        orderBy: {
            date: "desc",
        },
    });
    return voucher;
});
const getVoucherByVoucherNo = (voucherNo) => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            voucherNo: voucherNo,
        },
        include: {
            party: {
                select: {
                    name: true,
                    contactNo: true,
                    address: true,
                    partyType: true,
                },
            },
            customer: {
                select: {
                    name: true,
                    contactNumber: true,
                    address: true,
                },
            },
            bankTransaction: {
                select: {
                    date: true,
                    debitAmount: true,
                    creditAmount: true,
                    bankAccount: {
                        select: {
                            bankName: true,
                            branceName: true,
                            accountNumber: true,
                            status: true,
                        },
                    },
                },
            },
            journal: {
                select: {
                    accountsItemId: true,
                    date: true,
                    creditAmount: true,
                    debitAmount: true,
                    narration: true,
                    accountsItem: {
                        select: {
                            accountsItemName: true,
                        },
                    },
                },
            },
            inventory: {
                select: {
                    date: true,
                    unitPrice: true,
                    quantityAdd: true,
                    quantityLess: true,
                    discount: true,
                    debitAmount: true,
                    creditAmount: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    raWMaterial: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            logOrderItem: {
                select: {
                    id: true,
                    logGradeId: true,
                    radis: true,
                    height: true,
                    quantity: true,
                    u_price: true,
                    amount: true,
                },
            },
            logOrdByCategory: {
                select: {
                    date: true,
                    unitPrice: true,
                    quantityAdd: true,
                    quantityLess: true,
                    debitAmount: true,
                    creditAmount: true,
                    logCategory: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return voucher;
});
const getVoucherByid = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const voucher = yield prisma_1.default.transactionInfo.findFirst({
        where: {
            id,
        },
        include: {
            party: {
                select: {
                    name: true,
                    contactNo: true,
                    address: true,
                    partyType: true,
                },
            },
            customer: {
                select: {
                    name: true,
                    contactNumber: true,
                    address: true,
                },
            },
            bankTransaction: {
                select: {
                    date: true,
                    debitAmount: true,
                    creditAmount: true,
                    bankAccount: {
                        select: {
                            bankName: true,
                            branceName: true,
                            accountNumber: true,
                            status: true,
                        },
                    },
                },
            },
            journal: {
                select: {
                    accountsItemId: true,
                    date: true,
                    creditAmount: true,
                    debitAmount: true,
                    narration: true,
                    accountsItem: {
                        select: {
                            accountsItemName: true,
                        },
                    },
                },
            },
            inventory: {
                select: {
                    date: true,
                    unitPrice: true,
                    quantityAdd: true,
                    quantityLess: true,
                    discount: true,
                    debitAmount: true,
                    creditAmount: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    raWMaterial: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            logOrderItem: {
                select: {
                    id: true,
                    logGradeId: true,
                    radis: true,
                    height: true,
                    quantity: true,
                    u_price: true,
                    amount: true,
                },
            },
            logOrdByCategory: {
                select: {
                    date: true,
                    unitPrice: true,
                    quantityAdd: true,
                    quantityLess: true,
                    debitAmount: true,
                    creditAmount: true,
                    logCategory: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return voucher;
});
exports.VoucherService = {
    getAllVoucher,
    getVoucherByVoucherNo,
    getVoucherByid,
};
