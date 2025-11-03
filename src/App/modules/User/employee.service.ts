import { User, Prisma, Status } from "@prisma/client";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpars/paginationHelpers";
import { Request } from "express";

const creatUserToDB = async (req: Request): Promise<Partial<User>> => {
  req.body.photo = req?.file?.filename;

  console.log(req.body);
  const hashedPassword = bcrypt.hashSync(
    req.body.password,
    parseInt(config.hash_round as any)
  );

  const createUser = await prisma.user.create({
    data: {
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      photo: req.body.photo,
      mobile: req.body.mobile,
    },
  });
  return createUser;
};

const getAllUser = async () => {
  const result = await prisma.user.findMany({
    where: {
      status: Status.ACTIVE,
    },

    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      mobile: true,
      status: true,
    },
  });

  return result;
};

const getUserById = async (id: number) => {
  const result = await prisma.user.findFirst({
    where: {
      id: id,
      status: Status.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      name: true,
      photo: true,
      mobile: true,
      status: true,
    },
  });

  return result;
};

const updateUserById = async (id: number, payload: Partial<User>) => {
  const result = await prisma.user.update({
    where: {
      id: id,
      status: Status.ACTIVE,
    },
    data: payload,
  });

  return result;
};

const deleteUserById = async (id: number) => {
  console.log(id);
  const result = await prisma.user.update({
    where: {
      id: id,
      status: Status.ACTIVE,
    },
    data: {
      status: Status.DELETED,
    },
  });

  return result;
};

export const UserService = {
  creatUserToDB,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
