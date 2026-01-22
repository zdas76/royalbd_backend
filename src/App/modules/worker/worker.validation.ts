import { z } from "zod";

export const workerSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().regex(/^\d{10,11}$/, "Phone number must be 10 or 11 digits"),
        nid: z.string().regex(/^\d{10,17}$/, "NID must be a valid number"),
        address: z.string().min(1, "Address is required"),
        workingPlace: z.string().min(1, "Working place is required"),
        dob: z.string({ required_error: "Date of birth is required" }).optional(),
    })
});

export const updateWorkerSchema = z.object({
    body: z
        .object({
            name: z.string().min(1).optional(),
            phone: z.string().regex(/^\d{10,11}$/).optional(),
            nid: z.string().regex(/^\d{10,17}$/).optional(),
            address: z.string().min(1).optional(),
            workingPlace: z.string().min(1).optional(),
            dob: z.string().optional(),
        })
});
export const workerValidation = { workerSchema, updateWorkerSchema }