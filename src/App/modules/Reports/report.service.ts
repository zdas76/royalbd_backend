import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const getAccountLedgerReport = async (payload: {
  accountsItemId: number;
  startDate: string | null;
  endDate: string | null;
}) => {
  const accountsItemId = Number(payload.accountsItemId);
  const { startDate, endDate } = payload;

  const isExisted = await prisma.accountsItem.findFirst({
    where: {
      id: accountsItemId,
    },
  });

  if (!isExisted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Accounts Item not found");
  }
  if (startDate && endDate) {
    const result = await prisma.journal.findMany({
      where: {
        accountsItemId: accountsItemId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        accountsItem: true,
        date: true,
        debitAmount: true,
        creditAmount: true,
        narration: true,
      },
    });

    return result;
  } else {
    const result = await prisma.journal.findMany({
      where: {
        accountsItemId: accountsItemId,
      },
      orderBy: {
        date: "asc",
      },
      select: {
        accountsItem: true,
        date: true,
        debitAmount: true,
        creditAmount: true,
        narration: true,
      },
    });
    return result;
  }
};

const partyLedgerReport = async (payload: {
  partyId: number;
  startDate: string | null;
  endDate: string | null;
  partyType: string;
}) => {
  const partyId = Number(payload.partyId);
  const { startDate, endDate } = payload;

  if (!partyId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Party Id is required");
  }

  const party = await prisma.party.findFirst({
    where: { id: partyId },
  });

  if (!party) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Party not found");
  }

  let accountsItemId;

  if (payload.partyType === 'SUPPLIER') {

    const accountsItem = await prisma.accountsItem.findFirst({
      where: {
        accountsItemName: {
          contains: "accounts payable"
        },
      },
    });
    accountsItemId = accountsItem?.id;
  } else if (payload.partyType === 'VENDOR') {
    const accountsItem = await prisma.accountsItem.findFirst({
      where: {
        accountsItemName: {
          contains: "accounts receivable"
        },
      },
    });
    accountsItemId = accountsItem?.id;
  }

  if (!accountsItemId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Accounts Item not found");
  }

  const result = await prisma.journal.findMany({
    where: {
      accountsItemId: accountsItemId,
      transactionInfo: {
        partyId: party.id,
      },
      date: {
        gte: startDate ? new Date(startDate) : party.openingDate || new Date(),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    },
    orderBy: {
      date: "asc",
    },
    select: {
      transactionInfo: {
        select: {
          id: true,
          voucherNo: true,
          invoiceNo: true,
          partyId: true,
          voucherType: true,
        },
      },
      accountsItemId: true,
      date: true,
      creditAmount: true,
      debitAmount: true,
      narration: true,
    },

  });

  return { party, result };

}

// raw report
const rawReport = async (payload: {
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const allrawMaterial = await prisma.rawMaterial.findMany({
    where: {
      isDeleted: false
    },
  });
  if (allrawMaterial.length < 1) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Raw Material not found");
  }
  const result = Promise.all(allrawMaterial.map(async (rawMaterial) => {
    const total = await prisma.inventory.aggregate({
      _sum: {
        debitAmount: true,
        creditAmount: true,
        quantityAdd: true,
        quantityLess: true,
      },
      where: {
        AND: [
          {
            rawId: rawMaterial.id
          },
          {
            date: {
              gte: new Date(payload?.startDate || ""),
              lte: new Date(payload?.endDate || "")
            }
          }
        ]
      },
    })
    return { rawMaterial, total }
  }))

  return result;
};

const getRawReportById = async (id: number, payload: {
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const rawMaterial = await prisma.rawMaterial.findUnique({
    where: {
      id: id,
    },
  });

  if (!rawMaterial) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Raw Material not found");
  }

  const report = await prisma.inventory.findMany({

    where: {
      rawId: rawMaterial.id,
      date: {
        gte: rawMaterial.openingDate || new Date(payload?.startDate || ""),
        lte: new Date(payload?.endDate || new Date())
      }

    },
    select: {
      transactionInfo: {
        select: {
          id: true,
          voucherNo: true,
          voucherType: true,
        },
      },
    }
  })

  return { rawMaterial, report };
};

const productReport = async (payload: {
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const allProduct = await prisma.product.findMany({
    where: {
      isDeleted: false
    },
  });
  if (allProduct.length < 1) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Product not found");
  }
  const result = Promise.all(allProduct.map(async (product) => {
    const total = await prisma.inventory.aggregate({
      _sum: {
        debitAmount: true,
        creditAmount: true,
        quantityAdd: true,
        quantityLess: true,
      },
      where: {
        AND: [
          {
            productId: product.id
          },
          {
            date: {
              gte: product.openingDate || new Date(payload?.startDate || ""),
              lte: new Date(payload?.endDate || new Date())
            }
          }
        ]
      },
    })
    return { product, total }
  }))

  return result;
};

const getProductReportById = async (id: number, payload: {
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!product) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Product not found");
  }

  const report = await prisma.inventory.findMany({

    where: {
      productId: product.id,
      date: {
        gte: product.openingDate || new Date(payload?.startDate || ""),
        lte: new Date(payload?.endDate || new Date())
      }

    },
  })

  return { product, report };
};


export const ReportService = {
  getAccountLedgerReport,
  partyLedgerReport,
  rawReport,
  getRawReportById,
  productReport,
  getProductReportById,
};
