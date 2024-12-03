import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const currentQuotationId = req.nextUrl.searchParams.get("currentQuotationId") as string;
    const search = req.nextUrl.searchParams.get("search") as string;

    const quotations = await db.quotation.findMany({
      where: {
        id: {
          not: parseInt(currentQuotationId),
        },
        code: {
          contains: search,
        },
        invoices: {
          none: {}, // This checks that there are no related invoices
        },
      },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
