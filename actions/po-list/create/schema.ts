import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  purchaseOrderId: z.number(),
  name: z.string(), // product name
  productId: z.number({ invalid_type_error: "Please select a product" }),
  price: z.number().positive(),
  quantity: z.number().positive(),
});
