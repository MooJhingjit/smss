import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  try {
    const search = req.nextUrl.searchParams.get("search");
    const vendorId = req.nextUrl.searchParams.get("vendorId");


    if (!search) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conditions: any = {
      OR: [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ],
    }

    if (vendorId) {
      conditions["vendorId"] = Number(vendorId);
    }

    const product = await db.product.findMany({
      include: {
        vendor: true,
      },
      where: conditions
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
