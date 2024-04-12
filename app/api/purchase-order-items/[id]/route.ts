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
    const bodyWhitelist = ["withholdingTaxEnabled"];

    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    let payload = {
      ...body,
    };

    if (body.withholdingTaxEnabled !== undefined) {
      const withholdingTax = await calculateWithholdingTax(
        id,
        payload.withholdingTaxEnabled
      );
      payload = {
        ...payload,
        withholdingTax,
      };
    }

    const purchaseOrderItem = await db.purchaseOrderItem.update({
      where: {
        id: Number(id),
      },
      data: payload,
    });

    // update purchase order tax total and grand total
    if (body.withholdingTaxEnabled !== undefined) {
      await db.purchaseOrder.update({
        where: {
          id: purchaseOrderItem.purchaseOrderId,
        },
        data: {
          tax: purchaseOrderItem.withholdingTaxEnabled
            ? { increment: purchaseOrderItem.withholdingTax ?? 0 }
            : { decrement: purchaseOrderItem.withholdingTax ?? 0 },
          grandTotal: purchaseOrderItem.withholdingTaxEnabled
            ? { decrement: purchaseOrderItem.withholdingTax ?? 0 }
            : { increment: purchaseOrderItem.withholdingTax ?? 0 },
        },
      });
    }

    return NextResponse.json(purchaseOrderItem);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const calculateWithholdingTax = async (
  id: number,
  withholdingTaxEnabled: boolean
) => {
  // get current purchase order item price and calculate withholding tax
  const purchaseOrderItem = await db.purchaseOrderItem.findFirst({
    where: {
      id: Number(id),
    },
  });
  return (purchaseOrderItem?.price ?? 0) * 0.03;
};
