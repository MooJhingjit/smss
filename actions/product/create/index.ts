"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { ProductSchema } from "./schema";
// import { createAuditLog } from "@/lib/create-audit-log";
// import { ACTION, ENTITY_TYPE } from "@prisma/client";
// import {
//   incrementAvailableCount,
//   hasAvailableCount
// } from "@/lib/org-limit";
// import { checkSubscription } from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
  //   const { userId, orgId } = auth();

  //   if (!userId || !orgId) {
  //     return {
  //       error: "Unauthorized",
  //     };
  //   }

  //   const canCreate = await hasAvailableCount();
  //   const isPro = await checkSubscription();

  //   if (!canCreate && !isPro) {
  //     return {
  //       error: "You have reached your limit of free boards. Please upgrade to create more."
  //     }
  //   }

  const { name, cost, percentage } = data;
  let product;
  try {
    product = await db.product.create({
      data: {
        name,
        cost: cost ? parseFloat(cost) : null,
        percentage: percentage ? parseFloat(percentage) : null,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/users");
  return { data: product };
};

export const createProduct = createSafeAction(ProductSchema, handler);
