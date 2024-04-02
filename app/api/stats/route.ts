import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { useUser } from "@/hooks/use-user";

export async function GET(
  req: NextRequest,
  // { params }: { params: { search: string } }
) {
  const { isSeller, info } = await useUser();
  try {
    // const search = req.nextUrl.searchParams.get("search");

    // if (!info?.id) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // if (!search) {
    //   return new NextResponse("Bad Request", { status: 400 });
    // }

    const fullYearStats = {
      sales: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000000) + 1000),
      purchases: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000000) + 1000),
    }
    // console.log('vendors', vendors.)
    return NextResponse.json(fullYearStats);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
