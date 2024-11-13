import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationStatus } from "@prisma/client";

// PUT /api/quotations/:id
export async function PUT(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    // console.log("req.query", req.query);
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // body whitelist
    const bodyWhitelist = [
      "status",
      "purchaseOrderRef",
      "paymentDue",
      "paymentType",
      "deliveryPeriod",
      "validPricePeriod",
      "type"
    ];

    // check if body has any keys that are not in the whitelist
    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const quotation = await db.quotation.update({
      where: {
        id: Number(id),
      },
      data: {
        ...body,
      },
    });
    return NextResponse.json(quotation);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// delete 
export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    await db.quotation.delete({
      where: {
        id: Number(id),
      },
    });
    return new NextResponse("Deleted", { status: 204 });
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
