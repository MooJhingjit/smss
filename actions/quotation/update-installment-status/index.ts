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

  const { quotationId, installmentUpdates } = data;

  try {
    // First, verify the quotation exists and belongs to the user
    const quotation = await db.quotation.findFirst({
      where: {
        id: quotationId,
      },
      include: {
        installments: true,
      },
    });

    if (!quotation) {
      return {
        error: "Quotation not found or access denied",
      };
    }

    // Perform all updates in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update installment statuses, amounts, and due dates
      const updatedInstallments = [];
      
      for (const update of installmentUpdates) {
        const updateData: {
          status: typeof update.status;
          paidDate?: Date | null;
          amountWithVat?: number;
          amount?: number;
          dueDate?: Date;
        } = {
          status: update.status,
          paidDate: update.status === "paid" ? (update.paidDate || new Date()) : null,
        };

        // If amountWithVat is provided, update it and recalculate amount (without VAT)
        if (update.amountWithVat !== undefined) {
          updateData.amountWithVat = update.amountWithVat;
          updateData.amount = update.amountWithVat / 1.07; // Calculate amount without VAT
        }

        // If dueDate is provided, update it
        if (update.dueDate !== undefined) {
          updateData.dueDate = update.dueDate;
        }

        const updatedInstallment = await tx.quotationInstallment.update({
          where: { id: update.id },
          data: updateData,
        });
        updatedInstallments.push(updatedInstallment);
      }

      // Get all installments for this quotation to recalculate outstanding balances
      const allInstallments = await tx.quotationInstallment.findMany({
        where: { quotationId },
      });

      // Calculate outstanding balances
      const totalAmount = allInstallments.reduce((sum, item) => sum + item.amount, 0);
      const totalAmountWithVat = allInstallments.reduce((sum, item) => sum + item.amountWithVat, 0);
      
      const paidAmount = allInstallments
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.amount, 0);
      
      const paidAmountWithVat = allInstallments
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.amountWithVat, 0);

      const outstandingBalance = totalAmount - paidAmount;
      const outstandingGrandTotal = totalAmountWithVat - paidAmountWithVat;

      // Update quotation outstanding balances
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          outstandingBalance: Math.max(0, outstandingBalance), // Ensure no negative values
          outstandingGrandTotal: Math.max(0, outstandingGrandTotal),
        },
      });

      return updatedInstallments;
    });

    revalidateTag(`quotation-${quotationId}`);

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error updating installment status:", error);
    return {
      error: "Failed to update installment status",
    };
  }
};

export const updateInstallmentStatus = createSafeAction(schema, handler);
