import { z } from "zod";

export const Schema = z.object({
  id: z.number(),
  productId: z.number(),
  name: z.string({
    required_error: "Name is required",
  }),
  cost: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyDate: z.string().optional(),
  status: z.enum(["pending", "available", "sold", "claimed", "lost"]),
});
