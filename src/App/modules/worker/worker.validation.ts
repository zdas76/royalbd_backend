import { z } from "zod";

export const workerSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required"),
    phone: z
        .string()
        .regex(/^\d{10,11}$/, "Phone number must be 10 or 11 digits"),
    nid: z
        .string()
        .regex(/^\d{10,17}$/, "NID must be a valid number"),
    address: z
        .string()
        .min(1, "Address is required"),
    workingPlace: z
        .string()
        .min(1, "Working place is required"),
    dob: z
        .string()
        .refine(
            (val) => !isNaN(Date.parse(val)),
            { message: "Invalid date of birth" }
        ),
});


export const workerValidation = { workerSchema }