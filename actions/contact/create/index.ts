"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { ContactSchema } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { taxId, name, email, phone, fax, address } = data;
  let contact;
  try {
    contact = await db.contact.create({
      data: {
        name,
        taxId,
        email,
        phone,
        contact: data.contact,
        fax,
        address,
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
