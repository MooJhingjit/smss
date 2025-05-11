import { z } from "zod";
import { schema } from "./schema";
import { ActionState } from "@/lib/create-safe-action";
import { QuotationList } from "@prisma/client";

export type InputType = z.infer<typeof schema>;
export type ReturnType = ActionState<InputType, QuotationList[]>;
