"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { revalidatePath } from "next/cache";
import { updateAndLog } from "@/lib/log-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const {
    id,
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
    // quotationList = await db.quotationList.update({
    quotationList = await updateAndLog({
      model: "quotationList",
      where: {
        id,
      },
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
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath("/quotations/[id]");

  return { data: quotationList };
};

export const updateQuotationList = createSafeAction(schema, handler);
