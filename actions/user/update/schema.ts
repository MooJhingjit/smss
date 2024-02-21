import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  role: z.enum(["buyer", "vendor", "sale", "admin"]),
  taxId: z.string(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Email is invalid.",
    }),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional(),
});
