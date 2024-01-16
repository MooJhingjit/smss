import { NextResponse, NextRequest } from "next/server";

import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  try {
    const search = req.nextUrl.searchParams.get("search");
    const role = req.nextUrl.searchParams.get("role") as UserRole

    // const { userId, orgId } = auth();

    // if (!userId || !orgId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    if (!search || !role) {
      return new NextResponse("Bad Request", { status: 400 });
    }
    console.log("role", role)

    const vendors = await db.user.findMany({
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
            }
          }
        ],
        role: {
          equals: role
        }
      },
    })
    // console.log('vendors', vendors.)
    return NextResponse.json(vendors);
  } catch (error) {
    console.log("error", error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}