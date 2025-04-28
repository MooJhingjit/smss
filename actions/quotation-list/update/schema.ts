import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  id: z.number(),
  quotationId: z.number().int().positive(),
  productId: z.number().int(),
  name: z.string(),
  quotationType: z.enum(["product", "service"]),
  price: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  cost: z.number(),
  percentage: z.number().optional(),
  quantity: z.number().optional(),
  withholdingTax: z.number().optional(),
  withholdingTaxPercent: z.number().optional(),
  discount: z.number().optional(),
  totalPrice: z.number().nonnegative(),
  description: z.string().optional(),
  subItems: z.string().optional(),
});
