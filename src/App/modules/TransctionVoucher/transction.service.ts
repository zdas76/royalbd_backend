import prisma from "../../../shared/prisma";

const getAllVoucher = async () => {
  const voucher = await prisma.transactionInfo.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return voucher;
};

const getVoucherByVoucherNo = async (voucherNo: string) => {
  const voucher = await prisma.transactionInfo.findFirst({
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
};

const getVoucherByid = async (id: number) => {

  const voucher = await prisma.transactionInfo.findFirst({
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
};

export const VoucherService = {
  getAllVoucher,
  getVoucherByVoucherNo,
  getVoucherByid,
};
