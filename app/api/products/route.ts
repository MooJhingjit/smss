import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  try {
    const search = req.nextUrl.searchParams.get("search");

    // const { userId, orgId } = auth();

    // if (!userId || !orgId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    if (!search) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const product = await db.product.findMany({
      where: {
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
        // xxx: {
        //   equals: xxx
        // }
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
