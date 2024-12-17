import { z } from "zod";
import { Quotation } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { schema, serviceQuotationSummarySchema } from "./schema";

export type InputType = z.infer<typeof schema>;
export type ReturnType = ActionState<InputType, Quotation>;


export type ServiceQuotationInputType = z.infer<typeof serviceQuotationSummarySchema>;
export type ReturnServiceQuotationType = ActionState<InputType, Quotation>;