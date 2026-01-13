import { z } from "zod";

const createUser = z.object({
  email: z.string({ required_error: "Email is required" }),
  password: z.string({ required_error: "Password is required" }),
  name: z.string({ required_error: "Name is required" }),
  phone: z.string({ required_error: "Mobile number is required" }),
});
export type TUser = z.infer<typeof createUser>

const updateUser = z.object({
  name: z.string({ required_error: "Name is required" }).optional(),
  mobile: z.string({ required_error: "Working Place is required" }).optional(),
});

export const userValidaton = {
  createUser,
  updateUser,
};
