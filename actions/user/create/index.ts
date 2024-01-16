"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { UserSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {

  const { role, taxId, name, email, phone, contact, fax, address } = data;
  let user;
  try {
    user = await db.user.create({
      data: {
        role,
        name,
        taxId,
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
