"use server";

// import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { ContactSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, taxId, branchId, name, email, phone, contact, fax, address, isProtected } =
    data;
  let buyer;
  try {
    const payload: any = {
      taxId,
      branchId,
      name,
      email,
      phone,
      contact,
      fax,
      address,
      isProtected,
    };

    buyer = await db.contact.update({
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
            "ข้อมูลซ้ำ กรุณาตรวจสอบ อีเมล์ สาขา หรือ เลขผู้เสียภาษี",
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

  revalidatePath("/contacts");
  return { data: buyer };
};

export const updateContact = createSafeAction(ContactSchema, handler);
