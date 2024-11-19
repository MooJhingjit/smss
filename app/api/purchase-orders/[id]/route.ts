import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: { id: number } },
) {
  try {
    // console.log("req.query", req.query);
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // body whitelist
    const bodyWhitelist = ["status", "paymentDue", "paymentType", "vendorQtCode"];

    // check if body has any keys that are not in the whitelist
    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const purchaseOrder = await db.purchaseOrder.update({
      where: {
        id: Number(id),
      },
      data: {
        ...body,
      },
    });
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
