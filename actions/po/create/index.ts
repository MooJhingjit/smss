"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { PurchaseOrderPaymentType, PurchaseOrderStatus } from "@prisma/client";
import { generateCode, getCurrentDateTime, parseSequenceNumber } from "@/lib/utils";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { vendorId } = data;
  let purchaseOrder;
  try {
    if (!vendorId) {
      return {
        error: "Failed to create.",
      };
    }
    
    // const today = new Date(Date.UTC(2025, 1, 1));
    const today = getCurrentDateTime();

    purchaseOrder = await db.purchaseOrder.create({
      data: {
        code: "DRAFT-PO-" + Math.floor(Math.random() * 1000000),
        vendorId,
        status: PurchaseOrderStatus.draft,
        paymentType: PurchaseOrderPaymentType.cash,
        createdAt: today,
        updatedAt: today,
      },
    });

    // 1) Find the most recently created quotation (descending by code)
    // that starts with prefix + year + month.
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const lastPO = await db.purchaseOrder.findFirst({
      where: {
        code: {
          startsWith: `PO${year}${month}`,
        },
      },
      orderBy: {
        code: "desc",
      },
    });

    // 2) Parse the last 4 digits to figure out the sequence number
    let nextSequence = parseSequenceNumber(lastPO?.code ?? "");

    // update code
    const code = generateCode(
      purchaseOrder.id,
      "PO",
      purchaseOrder.createdAt,
      nextSequence
    );

    purchaseOrder = await db.purchaseOrder.update({
      where: {
        id: purchaseOrder.id,
      },
      data: {
        code,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      error: "Failed to create.",
    };
  }
  return { data: purchaseOrder };
};

export const createPurchaseOrder = createSafeAction(schema, handler);
