"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

  const { venderId, name, cost, percentage, description } = data;
  let product;
  try {
    product = await db.product.create({
      data: {
        venderId,
        name,
        cost: cost ? parseFloat(cost) : null,
        percentage: percentage ? parseFloat(percentage) : null,
        description
      },
    });
  } catch (error) {
    console.log(
      "error",
      error
    
    );
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/users");
  return { data: product };
};

export const createQuotation = createSafeAction(schema, handler);
