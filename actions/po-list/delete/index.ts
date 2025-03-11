"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";
import { updatePurchaseOrderSummary } from "@/app/services/service.purchase-order";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    // find the purchase order id
    const purchaseOrderItemId = data.id;
    const purchaseOrderItem = await db.purchaseOrderItem.findUnique({
      where: {
        id: purchaseOrderItemId,
      },
    });

    if (!purchaseOrderItem) {
      return {
        error: "Purchase order item not found.",
      };
    }

    await db.item.deleteMany({
      where: {
        purchaseOrderItemId,
      },
    });

    await db.purchaseOrderItem.delete({
      where: {
        id: purchaseOrderItemId,
      },
    });

    // update purchase order summary
    await updatePurchaseOrderSummary(purchaseOrderItem.purchaseOrderId);

    revalidatePath("/purchase-orders/[id]");

    return { data: true };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }
};

export const deletePurchaseItem = createSafeAction(schema, handler);
