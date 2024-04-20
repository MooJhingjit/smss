import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  id: z.number(),
  price: z.number().positive(),
  unitPrice: z.number().positive(),
  unit: z.string(),
  quantity: z.number().positive(),
  description: z.string().optional(),
});
