"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { UserSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, name, email, phone, contact, fax, address } = data;
  let user;
  try {
    user = await db.user.update({
      where: {
        id,
      },
      data: { name, email, phone, contact, fax, address },
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/users");
  return { data: user };
};

export const updateUser = createSafeAction(UserSchema, handler);
