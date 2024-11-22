"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    quotationId,
    productId,
    name,
    price,
    unitPrice,
    cost,
    percentage,
    quantity,
    withholdingTax,
    // withholdingTaxPercent,
    discount,
    totalPrice,
    description,
    subItems,
  } = data;

  let quotationList;
  try {
    quotationList = await db.quotationList.create({
      data: {
        quotationId,
        productId,
        name,
        price,
        unitPrice,
        cost,
        percentage,
        quantity,
        withholdingTax,
        // withholdingTaxPercent,
        discount,
        totalPrice,
        description,
        subItems,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/quotations/[id]");
  return { data: quotationList };
};

export const createQuotationList = createSafeAction(schema, handler);
