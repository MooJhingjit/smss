import { z } from "zod";

export const ProductSchema = z.object({
  venderId: z.number(),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(3, {
      message: "Name is too short.",
    }),
  cost: z.string().optional(),
  percentage: z.string().optional(),
});
