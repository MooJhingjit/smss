"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { purchaseOrderItemIds } = data;
  let itemReceipt;
  try {
    if (purchaseOrderItemIds.length === 0) {
      return {
        error: "Failed to create.",
      };
    }

    itemReceipt = await db.purchaseOrderItemReceipt.create({
      data: {},
    });

    await db.purchaseOrderItem.updateMany({
      where: {
        id: {
          in: purchaseOrderItemIds.map((id) => parseInt(id)),
        },
      },
      data: {
        receiptId: itemReceipt.id,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/purchase-orders/[purchaseOrderId]");

  return { data: itemReceipt };
};

export const createPurchaseOrderReceipt = createSafeAction(schema, handler);
