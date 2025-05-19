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
    const bodyWhitelist = ["allowedWithholdingTax", "hiddenInPdf"];

    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const res = await db.quotationList.update({
      where: {
        id: Number(id),
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json(res);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
