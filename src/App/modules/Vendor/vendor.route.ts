import express from "express";
import validationRequest from "../../middlewares/validationRequest";
import { VendorControllers } from "./vendor.controllers";
import { VendorValidation } from "./vendor.validation";

const route = express.Router();

route.post(
  "/",
  validationRequest(VendorValidation.createVendor),
  VendorControllers.createVendor
);

route.get("/", VendorControllers.getAllVendors);

route.get("/:id", VendorControllers.getVendorById);

route.put(
  "/:id",
  validationRequest(VendorValidation.updateVendor),
  VendorControllers.updateVendorById
);

route.delete("/:id", VendorControllers.deleteVendorById);

export const VendorRoute = route;
