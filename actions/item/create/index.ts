"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { Schema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { productId, name, cost, warrantyDate, serialNumber, status, description, purchaseOrderItemId } = data;
  let item;
  try {

    item = await db.item.create({
      data: {
        productId,
        name,
        cost: cost ? parseFloat(cost) : null,
        warrantyDate: warrantyDate ? new Date(warrantyDate) : null,
        serialNumber: serialNumber ?? null,
        status,
        description: description ?? null,
        purchaseOrderItemId: purchaseOrderItemId ?? null,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/products/[id]");
  return { data: item };
};

export const createItem = createSafeAction(Schema, handler);
