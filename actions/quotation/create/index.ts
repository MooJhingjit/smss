"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { getCurrentDateTime } from "@/lib/utils";
import { currentUser } from "@/lib/auth";
import { generateQuotationCode } from "@/lib/generate-code.service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const userSession = await currentUser();

  const { buyerId, type, overrideContactName, overrideContactEmail, overrideContactPhone } = data;
  let quotation;
  try {
    if (!buyerId || !type) {
      return {
        error: "Failed to create.",
      };
    }
    const today = getCurrentDateTime();

    quotation = await db.quotation.create({
      data: {
        type,
        code: "",
        sellerId: parseInt(userSession?.id ?? ""),
        contactId: buyerId,
        overrideContactName: overrideContactName || null,
        overrideContactEmail: overrideContactEmail || null,
        overrideContactPhone: overrideContactPhone || null,
        createdAt: today,
        updatedAt: today,
      },
    });

    // Generate code using the service
    const code = await generateQuotationCode(quotation.id, quotation.type, quotation.createdAt);

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
