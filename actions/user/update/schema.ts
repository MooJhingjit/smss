import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  role: z.enum(["buyer", "vendor", "sale", "seller", "admin"]),
  taxId: z.string().optional(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional().nullable(),
});
