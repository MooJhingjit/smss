"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { generateCode } from "@/lib/utils";
import { currentUser } from "@/lib/auth";
import { QuotationType } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const userSession = await currentUser();

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
        sellerId: parseInt(userSession?.id ?? ""),
        contactId: buyerId,
      },
    });

    // update code based on quotation ID
    const code = generateCode(quotation.id, quotation.type === QuotationType.product ? "QT" : "S_QT");
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
