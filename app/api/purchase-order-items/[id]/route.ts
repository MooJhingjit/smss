import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // body whitelist
    const bodyWhitelist = ["withholdingTaxEnabled", "vatExcluded"];

    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    let payload = {
      ...body,
    };

    // Get the current purchase order item for calculations
    const currentPurchaseOrderItem = await db.purchaseOrderItem.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!currentPurchaseOrderItem) {
      return new NextResponse("Purchase order item not found", { status: 404 });
    }

    if (body.withholdingTaxEnabled !== undefined) {
      const withholdingTax = calculateWithholdingTax(
        currentPurchaseOrderItem.price ?? 0,
        payload.withholdingTaxEnabled
      );
      payload = {
        ...payload,
        withholdingTax,
      };

      const purchaseOrderItem = await db.purchaseOrderItem.update({
        where: {
          id: Number(id),
        },
        data: payload,
      });

      // to deduct or add
      const withholdingTaxNumber = calculateWithholdingTax(
        currentPurchaseOrderItem.price ?? 0,
        true
      );

      await updatePurchaseOrderWithholdingTax(
        purchaseOrderItem.purchaseOrderId,
        purchaseOrderItem.withholdingTaxEnabled,
        withholdingTaxNumber
      );

      return NextResponse.json(purchaseOrderItem);
    }

    // Update purchase order: handle VAT exclusion changes
    if (body.vatExcluded !== undefined) {
      const purchaseOrderItem = await db.purchaseOrderItem.update({
        where: {
          id: Number(id),
        },
        data: {
          vatExcluded: body.vatExcluded,
        }
      });

      await updatePurchaseOrderVat(
        currentPurchaseOrderItem.purchaseOrderId,
        currentPurchaseOrderItem.price ?? 0,
        body.vatExcluded,
        currentPurchaseOrderItem.id
      );
      return NextResponse.json(purchaseOrderItem);
    }
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Calculate withholding tax (3% of the price)
const calculateWithholdingTax = (
  price: number,
  withholdingTaxEnabled: boolean
) => {
  return withholdingTaxEnabled ? price * 0.03 : 0;
};

// Update purchase order with new withholding tax values
const updatePurchaseOrderWithholdingTax = async (
  purchaseOrderId: number,
  withholdingTaxEnabled: boolean,
  withholdingTaxAmount: number
) => {
  // console.log(
  //   "🚀 ~ withholdingTaxAmount:",
  //   withholdingTaxEnabled,
  //   withholdingTaxAmount
  // );
  // Update the tax field in the purchase order
  await db.purchaseOrder.update({
    where: {
      id: purchaseOrderId,
    },
    data: {
      tax: withholdingTaxEnabled
        ? { increment: withholdingTaxAmount }
        : { decrement: withholdingTaxAmount },
    },
  });
};

// Update purchase order with new VAT values
const updatePurchaseOrderVat = async (
  purchaseOrderId: number,
  price: number,
  vatExcluded: boolean,
  itemId: number
) => {
  // Get the current purchase order with all items for calculations
  const purchaseOrder = await db.purchaseOrder.findFirst({
    where: {
      id: purchaseOrderId,
    },
    include: {
      purchaseOrderItems: true, // Include all items to recalculate VAT properly
    },
  });

  if (!purchaseOrder) return;

  // Calculate VAT for this item, so deduct or add it based on the vatExcluded status
  const vatForThisItem = price * 0.07;

  const totalVat = purchaseOrder.purchaseOrderItems.reduce((acc, item) => {
    // For the current item being updated, use the new VAT calculation
    if (item.id === itemId) {
      return acc + (vatExcluded ? 0 : vatForThisItem);
    }
    // For other items, calculate based on their current vatExcluded status
    return acc + (item.vatExcluded ? 0 : (item.price ?? 0) * 0.07);
  }, 0);

  // Calculate the new grand total (totalPrice + VAT + withholding tax)
  const updatedGrandTotal = (purchaseOrder.totalPrice ?? 0) + totalVat;

  // Update the purchase order with new VAT and grand total
  await db.purchaseOrder.update({
    where: {
      id: purchaseOrderId,
    },
    data: {
      vat: totalVat,
      grandTotal: updatedGrandTotal,
    },
  });
};
