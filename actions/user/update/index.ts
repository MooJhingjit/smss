"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { PrismaClient, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { UserSchema } from "./schema";
import bcrypt from "bcrypt";
import { updateAndLog } from "@/lib/log-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
    taxId,
    role,
    name,
    email,
    phone,
    contact,
    fax,
    address,
    password,
  } = data;
  let user;
  try {
    const payload: any = {
      role,
      taxId,
      name,
      email,
      phone,
      contact,
      fax,
      address,
    };
    if (password || password === "") {
      const hashPassword = password ? await bcrypt.hash(password, 10) : "";
      payload.password = hashPassword;
    }

    console.log("payload id", id);
    console.log("payload", payload);

    // user = await db.user.update({
    user = await updateAndLog({
      model: "user",
      where: {
        id,
      },
      data: payload,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
        return {
          error:
            "There is a unique constraint violation, a new user cannot be created with this email",
        };
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
