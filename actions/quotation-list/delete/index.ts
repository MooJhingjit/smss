"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    await db.quotationList.delete({
      where: {
        id: data.id,
      },
    });

    revalidatePath("/quotations/[id]");

    return { data: true };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }
};

export const deleteQuotationList = createSafeAction(schema, handler);
