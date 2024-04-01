import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  try {
    const { isSeller, info } = await useUser();
    const search = req.nextUrl.searchParams.get("search");

    if (!info?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!search) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    let contactScope = {};

    if (isSeller) {
      // only isProtected is false and sellerId = info.id
      contactScope = {
        isProtected: false,
        sellerId: parseInt(info.id),
      };
    }

    const vendors = await db.contact.findMany({
      where: {
        OR: [
          {
            email: {
              contains: search,
            },
          },
          {
            name: {
              contains: search,
            },
          },
        ],
        ...contactScope,
      },
    });
    // console.log('vendors', vendors.)
    return NextResponse.json(vendors);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
