import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  buyerId: z.number(),
  type: z.enum(["product", "service"]),
});
