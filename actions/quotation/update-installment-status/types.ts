import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { schema } from "./schema";
import { QuotationInstallment } from "@prisma/client";

export type InputType = z.infer<typeof schema>;
export type ReturnType = ActionState<InputType, QuotationInstallment[]>;
