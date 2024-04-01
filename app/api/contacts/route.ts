import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  const { isSeller, info } = await useUser();
  try {
    const search = req.nextUrl.searchParams.get("search");

    if (!info?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!search) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    let contactScope = {};

    if (isSeller) {
      // seller id is null or seller id is equal to info.id
      contactScope = {
        isProtected: false,
        OR: [
          {
            sellerId: {
              equals: null,
            },
          },
          {
            sellerId: {
              equals: parseInt(info.id),
            },
          },
        ],
      };
    }

    const vendors = await db.contact.findMany({
      where: {
       AND : [
        {
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
        },
        {...contactScope},
       ]
      },
    });
    // console.log('vendors', vendors.)
    return NextResponse.json(vendors);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
