"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";
import { updatePurchaseOrderSummary } from "@/app/services/service.purchase-order";
import { updateAndLog } from "@/lib/log-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, price, unitPrice, unit, quantity, description, discount = 0, extraCost = 0 } = data;

  let purchaseOrderItem;
  try {
    // Get the current item to check if withholdingTaxEnabled
    const currentItem = await db.purchaseOrderItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return { error: "Item not found." };
    }

    // Calculate net price and withholding tax if enabled
    const netPrice = price - discount + extraCost;
    const withholdingTax = currentItem.withholdingTaxEnabled ? netPrice * 0.03 : 0;

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
        discount,
        extraCost,
        withholdingTax,
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
