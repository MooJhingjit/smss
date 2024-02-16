"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    name,
  } = data;

  let purchaseOrderItem;
  try {
    purchaseOrderItem = await db.purchaseOrderItem.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/purchases/[id]");

  return { data: purchaseOrderItem };
};

export const updatePurchaseItem = createSafeAction(schema, handler);
