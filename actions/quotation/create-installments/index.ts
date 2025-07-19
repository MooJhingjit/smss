"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { schema } from "./schema";
import { currentUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const userSession = await currentUser();

  if (!userSession) {
    return {
      error: "Unauthorized",
    };
  }

  const { quotationId, periodCount } = data;

  try {
    // First, check if the quotation exists and belongs to the user
    const quotation = await db.quotation.findFirst({
      where: {
        id: quotationId,
      },
    });

    if (!quotation) {
      return {
        error: "Quotation not found or access denied",
      };
    }

    if (!quotation.totalPrice) {
      return {
        error: "Cannot create installments for quotation without total price",
      };
    }

    // Check if installments already exist
    const existingInstallments = await db.quotationInstallment.findMany({
      where: { quotationId },
    });

    if (existingInstallments.length > 0) {
      return {
        error: "Installments already exist for this quotation",
      };
    }

    // Calculate installment amounts (use totalPrice which is without VAT)
    const totalAmount = quotation.totalPrice;
    const baseAmount = Math.floor((totalAmount / periodCount) * 100) / 100; // Round down to 2 decimal places
    const remainder = totalAmount - (baseAmount * (periodCount - 1));

    // Create installments
    const installments: {
      quotationId: number;
      period: string;
      amount: number;
      amountWithVat: number;
      dueDate: Date;
      status: "pending";
    }[] = [];
    for (let i = 1; i <= periodCount; i++) {
      const amount = i === periodCount ? remainder : baseAmount; // Last installment gets the remainder
      const vatAmount = amount * 0.07; // 7% VAT
      const amountWithVat = amount + vatAmount;
      
      // Calculate due date (30 days apart starting from current date)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i * 30));

      installments.push({
        quotationId,
        period: `${i}/${periodCount}`,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        amountWithVat: Math.round(amountWithVat * 100) / 100,
        dueDate,
        status: "pending" as const,
      });
    }

    // Create all installments in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create installments
      const createdInstallments = await Promise.all(
        installments.map((installment) =>
          tx.quotationInstallment.create({
            data: installment,
          })
        )
      );

      // Update quotation outstanding balances (initially equals the original totals since nothing is paid)
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          outstandingBalance: quotation.totalPrice,
          outstandingGrandTotal: quotation.grandTotal,
        },
      });

      return createdInstallments;
    });

    revalidateTag(`quotation-${quotationId}`);

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error creating installments:", error);
    return {
      error: "Failed to create installments",
    };
  }
};

export const createInstallments = createSafeAction(schema, handler);
