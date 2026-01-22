import { Query, raw } from "mysql2";
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
}) => {
  const partyId = Number(payload.partyId);
  const { startDate, endDate } = payload;

  const party = await prisma.party.findFirst({
    where: { id: partyId },
  });

  if (!party) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Party not found");
  }
  const closingDate = new Date("2025-01-01");

  if (startDate && endDate) {
    const result = await prisma.journal.findMany({
      where: {
        transactionInfo: {
          partyId: partyId,
        },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        date: true,
        transactionInfo: true,
        debitAmount: true,
        creditAmount: true,
        narration: true,
      },
    });
    return result;
  } else {
    const result = await prisma.journal.findMany({
      where: {
        transactionInfo: {
          partyId: partyId,
        },
        date: {
          gt: new Date(closingDate.setDate(closingDate.getDate() + 1)),
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        transectionId: true,
        accountsItem: {
          select: {
            accountsItemName: true,
          },
        },
        date: true,
        creditAmount: true,
        debitAmount: true,
        narration: true,
      },
    });
    return result;
  }
};
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
  const result = Promise.all(allrawMaterial.map(async (rawMaterial) => (
    await prisma.inventory.aggregate({
      _sum: {
        debitAmount: true,
        creditAmount: true
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
  )))
  console.log(result)
  return result;
};
export const ReportService = {
  getAccountLedgerReport,
  partyLedgerReport,
  rawReport,
};
