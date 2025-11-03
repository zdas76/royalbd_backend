import express from "express";
import { VoucherController } from "./transction.controllers";

const route = express.Router();

route.get("/", VoucherController.getAllVoucher);

route.get("/voucherNo/:voucherNo", VoucherController.getVoucherbyVoucherNo);

route.get("/:id", VoucherController.getVoucherbyid);

export const VoucherRoute = route;
