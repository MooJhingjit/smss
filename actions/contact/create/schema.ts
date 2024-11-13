import { z } from "zod";

export const ContactSchema = z.object({
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
    branchId: z.string().optional(),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  isProtected: z.boolean().optional(),
});
