"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { ContactSchema } from "./schema";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { taxId, branchId, name, email, phone, fax, address, isProtected } = data;

  const userSession = await currentUser();
  console.log("🚀 ~ userSession:", userSession);
  let contact;
  try {
    contact = await db.contact.create({
      data: {
        name,
        taxId,
        branchId,
        email,
        phone,
        contact: data.contact,
        fax,
        address,
        isProtected,
        sellerId: parseInt(userSession?.id ?? ""),
      },
    });
  } catch (error) {
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/contacts");
  return { data: contact };
};

export const createContact = createSafeAction(ContactSchema, handler);
