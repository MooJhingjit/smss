import { z } from "zod";
import { Item } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { Schema } from "./schema";

export type InputType = z.infer<typeof Schema>;
export type ReturnType = ActionState<InputType, Item>;
