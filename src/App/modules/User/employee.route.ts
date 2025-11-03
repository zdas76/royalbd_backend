import { UserControllers } from "./empoyee.controllers";
import express, { NextFunction, Request, Response } from "express";
import upload from "../../../helpars/uploads";
import { userValidaton } from "./employee.validation";

const route = express.Router();

route.post(
  "/create-user",
  upload.single("photo"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidaton.createUser.parse(JSON.parse(req.body.data));

    return UserControllers.createUser(req, res, next);
  }
);

route.get("/", UserControllers.getUser);

route.get("/:id", UserControllers.getUserById);

route.put(
  "/:id",
  upload.single("photo"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidaton.updateUser.parse(JSON.parse(req.body.data));

    return UserControllers.updateUserById(req, res, next);
  }
);

route.delete("/:id", UserControllers.deleteUserById);

export const UserRoute = route;
