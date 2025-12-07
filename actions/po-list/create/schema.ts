import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  purchaseOrderId: z.number(),
  name: z.string(), // product name
  productId: z.number({ invalid_type_error: "Please select a product" }),
  price: z.number().positive(),
  unitPrice: z.number().positive(),
  unit: z.string(),
  quantity: z.number().positive(),
  discount: z.number(),
  extraCost: z.number(),
  description: z.string().optional(),
  type: z.enum(["product", "service"]),
});
