"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {

    await db.item.deleteMany({
      where: {
        purchaseOrderItemId: data.id,
      },
    });

    await db.purchaseOrderItem.delete({
      where: {
        id: data.id,
      },
    });

    revalidatePath("/purchases/[id]");

    return { data: true };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }
};

export const deletePurchaseItem = createSafeAction(schema, handler);
