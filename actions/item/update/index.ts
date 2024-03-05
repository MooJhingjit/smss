"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { Schema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, name, warrantyDate, serialNumber, description } = data;

  let item;
  try {
    item = await db.item.update({
      where: {
        id,
      },
      data: {
        name,
        warrantyDate: warrantyDate ? new Date(warrantyDate) : null,
        serialNumber,
        description,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("Error code: ", e.code);
    }
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/products/[id]");
  return { data: item };
};

export const updateItem = createSafeAction(Schema, handler);
