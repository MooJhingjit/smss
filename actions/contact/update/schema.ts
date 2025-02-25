import { z } from "zod";

export const ContactSchema = z.object({
  id: z.number(),
  taxId: z.string(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  email: z.string().email().optional().or(z.literal("")),
    branchId: z.string().optional(),
  phone: z.string().optional(),
  contact: z.string().optional(),
  fax: z.string().optional(),
  address: z.string().optional(),
  isProtected: z.boolean().optional(),
});
