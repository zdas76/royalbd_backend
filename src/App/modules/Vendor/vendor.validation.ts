import z from "zod";

const createVendor = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).trim(),
    contactNo: z.string({ required_error: "Contact Number is required" }),
    address: z.string().optional(),
    openingAmount: z.number().optional(),
    openingDate: z.string().optional(),
  }),
});
const updateVendor = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    contactNo: z.string().optional(),
    address: z.string().optional(),
    openingAmount: z.number().optional(),
    openingDate: z.string().optional(),
  }),
});

export const VendorValidation = {
  createVendor,
  updateVendor,
};
