import { z } from "zod";

export const schema = z.object({
  quotationId: z.number(),
  periodCount: z.number().min(1).max(60), // Allow up to 60 installments
  installmentContractNumber: z.string().optional(), // Contract number for installment payments
});
