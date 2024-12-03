"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { generateCode } from "@/lib/utils";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const billGroup = await db.billGroup.create({
      data: {
        // code: generateCode(),
        date: new Date(),
      },
    });

    const invoice = await db.invoice.create({
      data: {
        // code: generateCode(),
        // date: new Date(),
        billGroupId: billGroup.id,
        quotationId: data.quotationId,
      },
    });

    return { data: invoice };
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }
};

export const createQuotation = createSafeAction(schema, handler);
