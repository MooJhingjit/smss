import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  quotationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  name: z.string(),
  price: z.number().positive(),
  unitPrice: z.number().positive(),
  cost: z.number().positive(),
  percentage: z.number().optional(),
  quantity: z.number().positive(),
  withholdingTax: z.number().optional(),
  withholdingTaxPercent: z.number().optional(),
});
