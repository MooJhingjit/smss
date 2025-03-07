"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    await db.item.delete({
      where: {
        id: data.id,
      },
    });


    return { data: true };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }
};

export const deleteItem = createSafeAction(schema, handler);
