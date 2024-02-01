import { NextResponse, NextRequest, } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { QuotationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") as QuotationStatus;
    const code = req.nextUrl.searchParams.get("code") as string
    // const buyerName = req.nextUrl.searchParams.get("buyer")  as string

    if (!status) {
      return new NextResponse("Missing status", { status: 400 });
    }

    const quotations = await db.quotation.findMany({
      include: {
        buyer: true,
      },
      where: {
        code: {
          contains: code,
        },
        // buyer: {
        //   name: {
        //     contains: buyerName,
        //   },
        // },
        status: {
          equals: status,
        },
      },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// // PUT /api/quotations/:id
// export async function PUT(req: NextApiRequest) {
//   try {
//     const { id } = req.query;
//     const { status } = await req.body.json();

//     if (!id) {
//       return new NextResponse("Missing id", { status: 400 });
//     }

//     if (!status) {
//       return new NextResponse("Missing status", { status: 400 });
//     }

//     const quotation = await db.quotation.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         status,
//       },
//     });
//     return NextResponse.json(quotation);
//   } catch (error) {
//     console.log("error", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
