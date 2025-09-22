"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";
import { updatePurchaseOrderSummary } from "@/app/services/service.purchase-order";
import { updateAndLog } from "@/lib/log-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, price, unitPrice, unit, quantity, description } = data;

  let purchaseOrderItem;
  try {
    // purchaseOrderItem = await db.purchaseOrderItem.update({
      purchaseOrderItem = await updateAndLog({
      model: "purchaseOrderItem",
      where: {
        id,
      },
      data: {
        // do not allow to update quantity and type for now
        price,
        unitPrice,
        unit,
        // quantity,
        description,
      },
    });

    // update purchase order summary
    await updatePurchaseOrderSummary(purchaseOrderItem.purchaseOrderId);
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/purchase-orders/[id]");

  return { data: purchaseOrderItem };
};

export const updatePurchaseItem = createSafeAction(schema, handler);
