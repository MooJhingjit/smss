import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  quotationId: z.number().int().positive(),
  productId: z.number().int().positive(),
  name: z.string(),
  price: z.number().int().positive(),
  unitPrice: z.number().int().positive(),
  cost: z.number().int().positive(),
  percentage: z.number().int().positive(),
  quantity: z.number().int().positive(),
  withholdingTax: z.number().int().positive().optional(),
  withholdingTaxPercent: z.number().int().positive().optional(),
});
