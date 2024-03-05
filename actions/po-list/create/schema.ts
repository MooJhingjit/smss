import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  purchaseOrderId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});
