import { z } from "zod";

export const schema = z.object({
  id: z.number(),
  overrideContactName: z.string().optional(),
  overrideContactEmail: z.string().optional(),
  overrideContactPhone: z.string().optional(),
});
