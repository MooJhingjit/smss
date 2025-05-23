"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { ProductSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, cost, percentage, description,unit, type, name} = data;
  let product;
  try {
    product = await db.product.update({
      where: {
        id,
      },
      data: {
        cost: cost ? parseFloat(cost) : null,
        name,
        type,
        percentage: percentage ? parseFloat(percentage) : null,
        unit,
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

    // console.log("error", error)
    // return {
    //   error: "Failed to update.",
    // };
  }

  revalidatePath("/products");
  return { data: product };
};

export const updateProduct = createSafeAction(ProductSchema, handler);
