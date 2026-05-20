"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerValidation = exports.updateWorkerSchema = exports.workerSchema = void 0;
const zod_1 = require("zod");
exports.workerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        phone: zod_1.z.string().regex(/^\d{10,11}$/, "Phone number must be 10 or 11 digits"),
        nid: zod_1.z.string().regex(/^\d{10,17}$/, "NID must be a valid number"),
        address: zod_1.z.string().min(1, "Address is required"),
        workingPlace: zod_1.z.string().min(1, "Working place is required"),
        dob: zod_1.z.string({ required_error: "Date of birth is required" }).optional(),
    })
});
exports.updateWorkerSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).optional(),
        phone: zod_1.z.string().regex(/^\d{10,11}$/).optional(),
        nid: zod_1.z.string().regex(/^\d{10,17}$/).optional(),
        address: zod_1.z.string().min(1).optional(),
        workingPlace: zod_1.z.string().min(1).optional(),
        dob: zod_1.z.string().optional(),
    })
});
exports.workerValidation = { workerSchema: exports.workerSchema, updateWorkerSchema: exports.updateWorkerSchema };
