import { z } from "zod";

export const schema = z.object({
  quotationId: z.number(),
  installmentUpdates: z.array(z.object({
    id: z.number(),
    status: z.enum(["draft", "pending", "paid", "overdue"]),
    amount: z.number().optional(),
    dueDate: z.date().optional(),
    paidDate: z.date().optional().nullable(),
  })),
});
