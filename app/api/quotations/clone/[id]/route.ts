import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentDateTime } from "@/lib/utils";
import { generateQuotationCode } from "@/lib/generate-code.service";
import { QuotationStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { contactId, sellerId } = body;

    if (!contactId || !sellerId) {
      return NextResponse.json(
        { error: "contactId and sellerId are required" },
        { status: 400 }
      );
    }

    const originalQuotationId = parseInt(params.id);

    if (!originalQuotationId) {
      return NextResponse.json(
        { error: "Invalid quotation ID" },
        { status: 400 }
      );
    }

    // Get the original quotation with its lists
    const originalQuotation = await db.quotation.findUnique({
      where: { id: originalQuotationId },
      include: {
        lists: true,
      },
    });

    if (!originalQuotation) {
      return NextResponse.json(
        { error: "Original quotation not found" },
        { status: 404 }
      );
    }

    const today = getCurrentDateTime();

    // Create new quotation (clone)
    const newQuotation = await db.quotation.create({
      data: {
        type: originalQuotation.type,
        code: "", // Will be updated after creation
        contactId: parseInt(contactId),
        sellerId: parseInt(sellerId),
        paymentType: originalQuotation.paymentType,
        remark: originalQuotation.remark,
        deliveryPeriod: originalQuotation.deliveryPeriod,
        validPricePeriod: originalQuotation.validPricePeriod,
        paymentCondition: originalQuotation.paymentCondition,
        status: QuotationStatus.open, // Always set to open for new quotations
        createdAt: today,
        updatedAt: today,
      },
    });

    // Generate code for the new quotation
    const code = await generateQuotationCode(
      newQuotation.id,
      newQuotation.type,
      newQuotation.createdAt
    );

    // Update the quotation with the generated code
    const updatedQuotation = await db.quotation.update({
      where: { id: newQuotation.id },
      data: { code },
    });

    // Clone all quotation lists
    const clonedLists = await Promise.all(
      originalQuotation.lists.map(async (list) => {
        return await db.quotationList.create({
          data: {
            quotationId: newQuotation.id,
            productId: list.productId,
            name: list.name,
            price: list.price,
            productType: list.productType,
            unitPrice: list.unitPrice,
            unit: list.unit,
            cost: list.cost,
            percentage: list.percentage,
            quantity: list.quantity,
            withholdingTax: list.withholdingTax,
            withholdingTaxPercent: list.withholdingTaxPercent,
            hiddenInPdf: list.hiddenInPdf,
            allowedWithholdingTax: list.allowedWithholdingTax,
            discount: list.discount,
            totalPrice: list.totalPrice,
            description: list.description,
            subItems: list.subItems,
            groupName: list.groupName,
            order: list.order,
            createdAt: today,
            updatedAt: today,
          },
        });
      })
    );

    return NextResponse.json({
      data: {
        quotationId: updatedQuotation.id,
        totalLists: clonedLists.length,
      },
      message: "Quotation cloned successfully",
    });
  } catch (error) {
    console.error("Error cloning quotation:", error);
    return NextResponse.json(
      { error: "Failed to clone quotation" },
      { status: 500 }
    );
  }
}