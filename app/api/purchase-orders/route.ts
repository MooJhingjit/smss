import { NextResponse, NextRequest, } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const quotationId = req.nextUrl.searchParams.get("quotationId");

    // get all quotation items from quotationId
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        quotationId: Number(quotationId)
      },
      include: {
        vendor: true,
      }
    })

    return NextResponse.json(purchaseOrders);    
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
