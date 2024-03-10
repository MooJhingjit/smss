import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  id: z.number(),
  remark: z.string().optional(),
  formType: z.enum(["billing", "remark"]),
  discount:  z.number().optional(),
  extraCost:  z.number().optional(),
  totalPrice:  z.number().optional(),
  tax:  z.number().optional(),
  vat:  z.number().optional(),
  grandTotal:  z.number().optional(),
});
