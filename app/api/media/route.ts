import { NextResponse, NextRequest } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  try {
    const refType = req.nextUrl.searchParams.get("refType");
    const refId = req.nextUrl.searchParams.get("refId");
    const field = getRefKey(refType ?? "");
    console.log("field", field);
    if (!refType || !refId || !field) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const files = await db.media.findMany({
      where: {
        [field]: parseInt(refId),
      },
    });
    // console.log('vendors', vendors.)
    return NextResponse.json(files);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const getRefKey = (refType: string) => {
  switch (refType) {
    case "quotation":
      return "quotationId";
    case "purchaseOrder":
      return "purchaseOrderId";
    default:
      return "";
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refType, refId, url } = body;

    const field = getRefKey(refType ?? "");
    const data = {
      name: "default",
      [field]: parseInt(refId),
      url,
    };

    const res = await db.media.create({
      data,
    });

    // return success message
    return NextResponse.json(res);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
