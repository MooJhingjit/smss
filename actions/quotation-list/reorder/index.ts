"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { quotationId, items } = data;

  try {
    // Create an array of update operations
    const updateOperations = items.map(item => 
      db.quotationList.update({
        where: {
          id: item.id,
        },
        data: {
          order: item.order,
        },
      })
    );

    // Execute all updates in a transaction
    const updatedItems = await db.$transaction(updateOperations);

    // Revalidate the path to show updated order on the client
    revalidatePath(`/quotations/${quotationId}`);

    return { data: updatedItems };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to reorder items.",
    };
  }
};

export const reorderQuotationList = createSafeAction(schema, handler);
