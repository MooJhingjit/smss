"use server";
import { db } from "@/lib/db";
import { generateBillGroupCode } from "@/lib/generate-code.service";

interface CreateInstallmentBillGroupParams {
  installmentId: number;
  billGroupDate: string; // Can be empty string for existing bill groups
}

interface BillGroupResult {
  success: true;
  data: {
    billGroup: any; // Bill group with relations
    updatedInstallment: any; // Installment data
  };
}

interface BillGroupError {
  success: false;
  error: string;
}

export async function createInstallmentBillGroup({
  installmentId,
  billGroupDate
}: CreateInstallmentBillGroupParams): Promise<BillGroupResult | BillGroupError> {
  try {
    // Get the installment details
    const installment = await db.quotationInstallment.findUnique({
      where: { id: installmentId },
      include: {
        billGroup: true // Only need basic bill group info
      }
    });

    if (!installment) {
      throw new Error("Installment not found");
    }

    // If installment already has a bill group, return the existing one
    if (installment.billGroupId && installment.billGroup) {
      return {
        success: true,
        data: {
          billGroup: installment.billGroup,
          updatedInstallment: installment
        }
      };
    }

    // throw error if billGroupDate is not provided
    if (!billGroupDate) {
        throw new Error("Bill group date is required");
    }
    // Create a new bill group only if one doesn't exist
    const BILL_GROUP_DATE = new Date(billGroupDate);
    const createdBillGroup = await db.billGroup.create({
      data: {
        code: "",
        date: BILL_GROUP_DATE,
      },
    });

    // Generate and update the bill group code
    const code = await generateBillGroupCode(BILL_GROUP_DATE);
    const updatedBillGroup = await db.billGroup.update({
      where: { id: createdBillGroup.id },
      data: { code },
    });

    // Attach the installment to the new bill group
    const updatedInstallment = await db.quotationInstallment.update({
      where: { id: installmentId },
      data: { 
        billGroupId: createdBillGroup.id,
        status: "pending" // Update status when bill is generated
      },
    });

    return {
      success: true,
      data: {
        billGroup: updatedBillGroup, // Use the updated bill group directly
        updatedInstallment
      }
    };

  } catch (error) {
    console.error("Error creating installment bill group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bill group"
    };
  }
}

export async function getInstallmentBillGroups(installmentId: number) {
  try {
    const installment = await db.quotationInstallment.findUnique({
      where: { id: installmentId },
      include: {
        billGroup: {
          include: {
            quotationInstallments: {
              include: {
                quotation: {
                  include: {
                    contact: true
                  }
                }
              }
            },
            invoices: true
          }
        }
      }
    });

    return {
      success: true,
      data: installment
    };

  } catch (error) {
    console.error("Error getting installment bill groups:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get bill groups"
    };
  }
}
