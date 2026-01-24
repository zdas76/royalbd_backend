"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidaton = void 0;
const zod_1 = require("zod");
const createUser = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }),
    password: zod_1.z.string({ required_error: "Password is required" }),
    name: zod_1.z.string({ required_error: "Name is required" }),
    phone: zod_1.z.string({ required_error: "Mobile number is required" }),
});
const updateUser = zod_1.z.object({
    name: zod_1.z.string({ required_error: "Name is required" }).optional(),
    role: zod_1.z.enum(["admin", "user", "employee"]).optional(),
    phone: zod_1.z.string({ required_error: "Mobile number is required" }).optional(),
});
exports.userValidaton = {
    createUser,
    updateUser,
};
