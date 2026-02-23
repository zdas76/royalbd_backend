import prisma from "../../../shared/prisma";
import { StatusCodes } from "http-status-codes";
import { paginationHelper } from "../../../helpars/paginationHelpers";
import { IPaginationOptions } from "../../interfaces/pagination";
import AppError from "../../errors/AppError";
import { Vendor, Prisma } from "../../../../generated/prisma";
import { vendorSearchAbleFields } from "./vendor.constant";

const createVendor = async (payload: Vendor) => {
  const isExist = await prisma.vendor.findFirst({
    where: {
      name: payload.name,
      contactNo: payload.contactNo,
      isDeleted: false,
    },
  });

  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This Vendor Already Exist");
  }

  const result = await prisma.vendor.create({
    data: payload,
  });

  return result;
};

const getAllVendors = async (params: any, paginat: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.Pagination(paginat);

  const { searchTerm, ...filterData } = params;

  const andCondition: Prisma.VendorWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: vendorSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.VendorWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : { isDeleted: false };

  const result = await prisma.vendor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      paginat.sortBy && paginat.sortOrder
        ? {
            [paginat.sortBy]: paginat.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  return result;
};

const getVendorById = async (id: number) => {
  const result = await prisma.vendor.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  return result;
};

const updateVendorById = async (id: number, payload: Partial<Vendor>) => {
  const isExist = await prisma.vendor.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No Vendor Found ");
  }

  const result = await prisma.vendor.update({
    where: {
      id: id,
    },
    data: payload,
  });

  return result;
};

const deleteVendorById = async (id: number) => {
  const isExist = await prisma.vendor.findFirst({
    where: {
      id: id,
      isDeleted: false,
    },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No vendor found");
  }

  const result = await prisma.vendor.update({
    where: {
      id: id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const VendorService = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendorById,
  deleteVendorById,
};
