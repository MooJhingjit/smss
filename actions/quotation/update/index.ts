"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnServiceQuotationType, ReturnType, ServiceQuotationInputType } from "./types";
import { schema, serviceQuotationSummarySchema } from "./schema";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, remark } = data;
  let quotation;
  try {
    if (!id) {
      return {
        error: "Failed to create.",
      };
    }

    quotation = await db.quotation.update({
      where: { id },
      data: { remark },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/quotations/[quotationId]");

  return { data: quotation };
};

export const updateQuotation = createSafeAction(schema, handler);


const handlerServiceQuotationSummary = async (data: ServiceQuotationInputType): Promise<ReturnServiceQuotationType> => {
  const { id, totalPrice, discount, tax, grandTotal } = data;
  let quotation;
  try {
    quotation = await db.quotation.update({
      where: { id },
      data: {
        totalPrice,
        discount,
        tax,
        grandTotal,
        isLocked: true,
      },
    });

  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }

  revalidatePath("/quotations/[quotationId]");

  return { data: quotation };
};

export const updateServiceQuotationSummary = createSafeAction(serviceQuotationSummarySchema, handlerServiceQuotationSummary);

