import { z } from "zod";

export const Schema = z.object({
  productId: z.number(),
  name: z.string({
    required_error: "Name is required",
  }),
  cost: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyDate: z.string().optional(),
  status: z.enum(["pending", "available", "sold", "claimed", "lost"]),
  description: z.string().optional(),
  purchaseOrderItemId: z.number().optional(),
});
