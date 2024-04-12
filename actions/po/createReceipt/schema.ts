import { array, z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  purchaseOrderItemIds: array(z.string()),
});
