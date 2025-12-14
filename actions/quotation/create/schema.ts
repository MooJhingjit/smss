import { z } from "zod";
// import { QuotationType } from "@prisma/client";
// get data from QuotationType enum
export const schema = z.object({
  buyerId: z.number(),
  type: z.enum(["product", "service"]),
  overrideContactName: z.string().optional(),
  overrideContactEmail: z.string().optional(),
  overrideContactPhone: z.string().optional(),
  vatIncluded: z.boolean().optional(),
});
