import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UNPAID_STATUSES, getApprovedAtMonthlyWhere } from "@/lib/stats.service";

export async function GET(req: NextRequest) {
  try {
    const year = Number(req.nextUrl.searchParams.get("year"));
    const month = Number(req.nextUrl.searchParams.get("month")); // 0-11
    const sellerIdParam = req.nextUrl.searchParams.get("sellerId");
    const sellerId = sellerIdParam ? Number(sellerIdParam) : undefined;

    if (Number.isNaN(year) || Number.isNaN(month)) {
      return new NextResponse("Missing year or month", { status: 400 });
    }

    const baseWhere = getApprovedAtMonthlyWhere(year, month, sellerId);

    const select = {
      id: true,
      code: true,
      status: true,
      approvedAt: true,
      totalPrice: true,
      grandTotal: true,
      contact: { select: { name: true } },
      seller: { select: { name: true } },
    } as const;

    const [paid, unpaid, installment] = await Promise.all([
      db.quotation.findMany({
        where: { ...baseWhere, status: "paid" },
        select,
        orderBy: { approvedAt: "desc" },
      }),
      db.quotation.findMany({
        where: { ...baseWhere, status: { in: UNPAID_STATUSES } },
        select,
        orderBy: { approvedAt: "desc" },
      }),
      db.quotation.findMany({
        where: { ...baseWhere, status: "installment" },
        select,
        orderBy: { approvedAt: "desc" },
      }),
    ]);

    return NextResponse.json({ paid, unpaid, installment });
  } catch (error) {
    console.error("/api/stats/details error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
