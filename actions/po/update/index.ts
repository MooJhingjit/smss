"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    remark,
    formType,
    discount,
    extraCost,
    totalPrice,
    price,
    tax,
    vat,
    grandTotal,
  } = data;
  let purchaseOrder;
  try {
    if (!id) {
      return {
        error: "Failed to update.",
      };
    }

    if (formType === "billing") {
      purchaseOrder = await db.purchaseOrder.update({
        where: { id },
        data: {
          discount,
          extraCost,
          price,
          totalPrice,
          tax,
          vat,
          grandTotal,
        },
      });
    } else {
      purchaseOrder = await db.purchaseOrder.update({
        where: { id },
        data: { remark },
      });
    }
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/purchase-orders/[purchaseOrderId]");

  return { data: purchaseOrder };
};

export const updatePurchaseOrder = createSafeAction(schema, handler);
