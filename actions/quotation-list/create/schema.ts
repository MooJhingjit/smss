import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  quotationId: z.number().int().positive(),
  name: z.string(),
  totalPrice: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().positive(),
  quotationType: z.enum(["product", "service"]),

  // required for product
  productId: z.number().int(),
  price: z.number().nonnegative(),
  cost: z.number().positive(),

  percentage: z.number().optional(),
  withholdingTax: z.number().optional(),
  withholdingTaxPercent: z.number().optional(),
  discount: z.number().nullable().optional(),
  description: z.string().optional(),
  subItems: z.string().optional(),
});
