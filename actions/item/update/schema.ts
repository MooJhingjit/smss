import { z } from "zod";

export const Schema = z.object({
  id: z.number(),
  name: z.string({
    required_error: "Name is required",
  }),
  serialNumber: z.string().optional(),
  warrantyDate: z.string().optional(),
  description: z.string().optional(),
});
