"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { PrismaClient, Prisma } from '@prisma/client'
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
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      console.log('Error code: ', e.code)
      if (e.code === 'P2002') { // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
        return {
          error: 'There is a unique constraint violation, a new user cannot be created with this email'
        }
      }
    }
    return {
      error: "Failed to update.",
    };

    // console.log("error", error)
    // return {
    //   error: "Failed to update.",
    // };
  }

  revalidatePath("/users");
  return { data: user };
};

export const updateUser = createSafeAction(UserSchema, handler);
