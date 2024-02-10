import { z } from "zod";
import { PurchaseOrderItem } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { schema } from "./schema";

export type InputType = z.infer<typeof schema>;
export type ReturnType = ActionState<InputType, PurchaseOrderItem>;
