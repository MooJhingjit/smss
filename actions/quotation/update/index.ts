"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnServiceQuotationType, ReturnType, ServiceQuotationInputType } from "./types";
import { schema, serviceQuotationSummarySchema } from "./schema";
import { revalidatePath } from "next/cache";
import { getCurrentDateTime } from "@/lib/utils";
import { updateAndLog } from "@/lib/log-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, remark } = data;
  let quotation;
  try {
    if (!id) {
      return {
        error: "Failed to create.",
      };
    }

    quotation = await updateAndLog({
      model: "quotation",
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
  const { id, totalPrice, discount, tax, grandTotal, customDate } = data;
  let quotation;
  try {
    // Use custom date if provided, otherwise use current date
    // customDate allows confirming quotation with the original date after rollback
    const approvedAt = customDate ? new Date(customDate) : getCurrentDateTime();
    quotation = await updateAndLog({
      model: "quotation",
      where: { id },
      data: {
        totalPrice,
        discount,
        tax,
        grandTotal,
        isLocked: true,
        approvedAt,
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

