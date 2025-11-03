import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReportController } from "./report.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Query } from "mysql2";

const ladgerReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportController.getAccountLedgerReport({
    accountsItemId: Number(req.query.accountsItemId),
    startDate: req.query.startDate ? String(req.query.startDate) : null,
    endDate: req.query.endDate ? String(req.query.endDate) : null,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ladger report retrived successfully",
    data: result,
  });
});

const partyReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportController.partyLedgerReport({
    partyId: Number(req.query.partyId),
    startDate: req.query.startDate ? String(req.query.startDate) : null,
    endDate: req.query.endDate ? String(req.query.endDate) : null,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ladger report retrived successfully",
    data: result,
  });
});

export const ReportControllers = {
  ladgerReport,
  partyReport,
};
