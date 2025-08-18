"use server";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { PurchaseOrderPaymentType, PurchaseOrderStatus } from "@prisma/client";
import { getCurrentDateTime } from "@/lib/utils";
import { generatePurchaseOrderCode } from "@/lib/generate-code.service";

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

    // Generate code using the service
    const code = await generatePurchaseOrderCode(purchaseOrder.id, purchaseOrder.createdAt);

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
