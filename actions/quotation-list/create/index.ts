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
    productType,
    name,
    price,
    unitPrice,
    cost,
    unit,
    percentage,
    quantity,
    withholdingTax,
    // withholdingTaxPercent,
    discount,
    totalPrice,
    description,
    groupName,
    subItems,
  } = data;

  let quotationList;
  try {
    // Count total QuotationList items for this quotation to determine the next order value
    const totalItems = await db.quotationList.count({
      where: { quotationId },
    });

    // Next order value will be the total number of existing items + 1
    const nextOrder = totalItems + 1;

    quotationList = await db.quotationList.create({
      data: {
        quotationId,
        productId,
        productType,
        name,
        price,
        unitPrice,
        cost,
        unit,
        percentage,
        quantity,
        withholdingTax,
        // withholdingTaxPercent,
        discount,
        totalPrice,
        description,
        groupName,
        subItems,
        order: nextOrder, // Set the order to be the next value
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
