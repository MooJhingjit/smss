"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";
import { PurchaseOrderItem } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    purchaseOrderId,
    name,
    price,
    quantity,
    productId
  } = data;

  let purchaseOrderItem: PurchaseOrderItem;
  try {
    purchaseOrderItem = await db.purchaseOrderItem.create({
      data: {
        purchaseOrderId,
        name,
        price,
        quantity
      }
    });

    await Promise.all(
      Array.from({ length: quantity ?? 1 }).map(
        async () =>
          await db.item.create({
            data: {
              productId,
              purchaseOrderItemId: purchaseOrderItem.id,
              name: name,
              cost: price
            },
          })
      )
    );


  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/purchases/[id]");

  return { data: purchaseOrderItem };
};

export const createPurchaseItem = createSafeAction(schema, handler);
