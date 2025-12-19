import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

// GET /api/quotation-snapshots/[quotationId]
export async function GET(
  req: NextRequest,
  context: { params: { quotationId: string } }
) {
  try {
    const { quotationId } = context.params;
    
    if (!quotationId) {
      return new NextResponse("Missing quotationId", { status: 400 });
    }

    const snapshots = await db.quotationSnapshot.findMany({
      where: {
        quotationId: parseInt(quotationId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
