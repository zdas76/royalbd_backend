import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { VendorService } from "./vendor.service";
import { vendorFiltersFields } from "./vendor.constant";

const createVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.createVendor(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor created successfully",
    data: result,
  });
});

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, vendorFiltersFields);
  const paginat = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await VendorService.getAllVendors(filters, paginat);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendors retrieved successfully",
    data: result,
  });
});

const getVendorById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const result = await VendorService.getVendorById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor retrieved successfully",
    data: result,
  });
});

const updateVendorById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const result = await VendorService.updateVendorById(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor updated successfully",
    data: result,
  });
});

const deleteVendorById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const result = await VendorService.deleteVendorById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Vendor deleted successfully",
    data: result,
  });
});

export const VendorControllers = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendorById,
  deleteVendorById,
};
