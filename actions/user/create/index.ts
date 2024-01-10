"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { UserSchema } from "./schema";
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

  const { name, email, phone, contact, fax, address } = data;
  let user;
  try {
    user = await db.user.create({
      data: {
        name,
        email,
        phone,
        contact,
        fax,
        address,
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/users");
  return { data: user };
};

export const createUser = createSafeAction(UserSchema, handler);
