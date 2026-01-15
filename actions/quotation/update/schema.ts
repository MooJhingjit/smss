import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  id: z.number(),
  remark: z.string().optional(),
});


export const serviceQuotationSummarySchema = z.object({
  id: z.number(),
  totalPrice: z.number(),
  discount: z.number(),
  tax: z.number(),
  grandTotal: z.number(),
  customDate: z.string().optional(), // Optional custom date for approvedAt (ISO string)
});
