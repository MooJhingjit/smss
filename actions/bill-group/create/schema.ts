import { z } from "zod";
export const schema = z.object({
  billGroupId: z.number().nullable(),
  currentQuotationId: z.number(),
  newQuotationId: z.number(),
  billGroupDate: z.string()
});
