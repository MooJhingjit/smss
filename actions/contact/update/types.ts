import { z } from "zod";
import { Contact } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { ContactSchema } from "./schema";

export type InputType = z.infer<typeof ContactSchema>;
export type ReturnType = ActionState<InputType, Contact>;
