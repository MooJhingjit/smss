import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = parseInt(params.id);

    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    // Get quotation with related data to validate
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        invoices: true,
        installments: {
          include: {
            invoice: true,
          },
        },
        purchaseOrders: {
          include: {
            purchaseOrderItems: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Validation 1: Cannot rollback if quotation has invoice or billGroupId
    if (quotation.invoices.length > 0 || quotation.billGroupId !== null) {
      return NextResponse.json(
        { error: "ไม่สามารถ rollback ได้เนื่องจากใบเสนอราคานี้มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว" },
        { status: 400 }
      );
    }

    // Validation 2: Cannot rollback if any installment has invoice or billGroupId
    const hasInstallmentWithInvoice = quotation.installments.some(
      (installment) => installment.invoice !== null || installment.billGroupId !== null
    );

    if (hasInstallmentWithInvoice) {
      return NextResponse.json(
        { error: "ไม่สามารถ rollback ได้เนื่องจากมีงวดผ่อนชำระที่มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว" },
        { status: 400 }
      );
    }

    // Perform rollback in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Delete all Items linked to PurchaseOrderItems
      const purchaseOrderItemIds = quotation.purchaseOrders.flatMap((po) =>
        po.purchaseOrderItems.map((poi) => poi.id)
      );

      if (purchaseOrderItemIds.length > 0) {
        await tx.item.deleteMany({
          where: {
            purchaseOrderItemId: {
              in: purchaseOrderItemIds,
            },
          },
        });
      }

      // 2. Delete all PurchaseOrderItems
      const purchaseOrderIds = quotation.purchaseOrders.map((po) => po.id);

      if (purchaseOrderIds.length > 0) {
        await tx.purchaseOrderItem.deleteMany({
          where: {
            purchaseOrderId: {
              in: purchaseOrderIds,
            },
          },
        });

        // 3. Delete all PurchaseOrders
        await tx.purchaseOrder.deleteMany({
          where: {
            id: {
              in: purchaseOrderIds,
            },
          },
        });
      }

      // 4. Delete all QuotationInstallments if exist
      if (quotation.installments.length > 0) {
        await tx.quotationInstallment.deleteMany({
          where: {
            quotationId: quotationId,
          },
        });
      }

      // 5. Reset quotation fields to null/default (rollback the updates from generate-all and service quotation summary)
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          totalPrice: null,
          discount: null,
          tax: null,
          grandTotal: null,
          approvedAt: null,
          isLocked: false,
          outstandingBalance: 0,
          outstandingGrandTotal: 0,
          installmentContractNumber: null,
        },
      });

      return {
        deletedPurchaseOrders: purchaseOrderIds.length,
        deletedInstallments: quotation.installments.length,
        deletedItems: purchaseOrderItemIds.length,
      };
    });

    return NextResponse.json({
      message: "Rollback successful",
      ...result,
    });
  } catch (error) {
    console.error("Error rolling back quotation:", error);
    return NextResponse.json(
      { error: "Failed to rollback quotation" },
      { status: 500 }
    );
  }
}

// GET method to check if rollback is allowed
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = parseInt(params.id);

    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        invoices: true,
        installments: {
          include: {
            invoice: true,
          },
        },
        purchaseOrders: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Check if quotation has invoice or billGroupId
    const hasInvoiceOrBillGroup =
      quotation.invoices.length > 0 || quotation.billGroupId !== null;

    // Check if any installment has invoice or billGroupId
    const hasInstallmentWithInvoice = quotation.installments.some(
      (installment) => installment.invoice !== null || installment.billGroupId !== null
    );

    const canRollback =
      !hasInvoiceOrBillGroup &&
      !hasInstallmentWithInvoice &&
      (quotation.purchaseOrders.length > 0 || quotation.isLocked);

    let disabledReason: string | null = null;
    if (hasInvoiceOrBillGroup) {
      disabledReason = "ใบเสนอราคานี้มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว";
    } else if (hasInstallmentWithInvoice) {
      disabledReason = "มีงวดผ่อนชำระที่มีใบแจ้งหนี้หรืออยู่ในกลุ่มบิลแล้ว";
    }

    return NextResponse.json({
      canRollback,
      disabledReason,
      hasPurchaseOrders: quotation.purchaseOrders.length > 0,
      hasInstallments: quotation.installments.length > 0,
      isLocked: quotation.isLocked,
    });
  } catch (error) {
    console.error("Error checking rollback status:", error);
    return NextResponse.json(
      { error: "Failed to check rollback status" },
      { status: 500 }
    );
  }
}
