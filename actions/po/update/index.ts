"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, remark } = data;
  let purchaseOrder;
  try {
    if (!id) {
      return {
        error: "Failed to create.",
      };
    }

    purchaseOrder = await db.purchaseOrder.update({
      where: { id },
      data: { remark },
    });

  
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/purchases/[purchaseOrderId]")

  return { data: purchaseOrder };
};

export const updatePurchaseOrder = createSafeAction(schema, handler);
