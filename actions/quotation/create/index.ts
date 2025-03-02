"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { parseSequenceNumber, generateCode, getCurrentDateTime } from "@/lib/utils";
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
    const today = new Date(Date.UTC(2025, 1, 1));
    // const today = getCurrentDateTime();

    // return {}
    quotation = await db.quotation.create({
      data: {
        type,
        code: "",
        sellerId: parseInt(userSession?.id ?? ""),
        contactId: buyerId,
        createdAt: today,
        updatedAt: today,
      },
    });

    const prefix = type === QuotationType.product ? "QT" : "S_QT";

    // 1) Find the most recently created quotation (descending by code)
    // that starts with prefix + year + month.
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const lastQuotation = await db.quotation.findFirst({
      where: {
        type,
        code: {
          startsWith: `${prefix}${year}${month}`,
        },
      },
      orderBy: {
        code: "desc",
      },
    });

    // 2) Parse the last 4 digits to figure out the sequence number
    let nextSequence = parseSequenceNumber(lastQuotation?.code ?? "");

    // update code based on quotation ID
    const code = generateCode(
      quotation.id,
      quotation.type === QuotationType.product ? "QT" : "S_QT",
      quotation.createdAt,
      nextSequence
    );

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
