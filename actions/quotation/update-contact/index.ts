"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidateTag } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, overrideContactName, overrideContactEmail, overrideContactPhone } = data;

  let quotation;

  try {
    quotation = await db.quotation.update({
      where: {
        id,
      },
      data: {
        overrideContactName: overrideContactName || null,
        overrideContactEmail: overrideContactEmail || null,
        overrideContactPhone: overrideContactPhone || null,
      },
    });

    revalidateTag("quotations");
  } catch (error) {
    return {
      error: "Failed to update quotation contact.",
    };
  }

  return { data: quotation };
};

export const updateQuotationContact = createSafeAction(schema, handler);
