"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { generateCode } from "@/lib/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { buyerId, type } = data;
  let quotation;
  try {
    if (!buyerId || !type) {
      return {
        error: "Failed to create.",
      };
    }

    quotation = await db.quotation.create({
      data: {
        type,
        code: "",
        contactId: buyerId,
      },
    });

    // update code based on quotation ID
    const code = generateCode(quotation.id, "QT");
    quotation = await db.quotation.update({
      where: { id: quotation.id },
      data: { code },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  return { data: quotation };
};

export const createQuotation = createSafeAction(schema, handler);
