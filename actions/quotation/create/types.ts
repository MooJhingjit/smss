import { z } from "zod";
import { Product } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { ProductSchema } from "./schema";

export type InputType = z.infer<typeof ProductSchema>;
export type ReturnType = ActionState<InputType, Product>;
