import { z } from "zod";

export const schema = z.object({
  quotationId: z.number({
    required_error: "Quotation ID is required",
    invalid_type_error: "Quotation ID is required",
  }),
  items: z.array(
    z.object({
      id: z.number(),
      order: z.number(),
    })
  ),
});
