import { z } from "zod";

export const ProductSchema = z.object({
  vendorId: z.number(),
  type:  z.enum(["product", "service"]),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  cost: z.string().optional(),
  percentage: z.string().optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
});
