import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { GradesOrderService } from "./gOrder.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await GradesOrderService.createGradesOrder(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Log Order created successfully",
    data: result,
  });
});

const getAllOrder = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, searchTerm } = req.query;
  const result = await GradesOrderService.getAllOrder({
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    searchTerm: searchTerm as string
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Log Order retrived successfully",
    data: result,
  });
});

const getTotelByCategoryId = catchAsync(async (req: Request, res: Response) => {

  const result = await GradesOrderService.getLogTotalByCagetoryId(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Log Total retrived successfully",
    data: (result as any)[0],
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrder,
  getTotelByCategoryId,
};
