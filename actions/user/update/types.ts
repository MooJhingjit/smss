import { z } from "zod";
import { User } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UserSchema } from "./schema";

export type InputType = z.infer<typeof UserSchema>;
export type ReturnType = ActionState<InputType, User>;
