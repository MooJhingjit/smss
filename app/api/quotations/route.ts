import { NextResponse, NextRequest } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { QuotationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") as QuotationStatus;
    const code = req.nextUrl.searchParams.get("code") as string;
    const buyerName = req.nextUrl.searchParams.get("buyer") as string;
    const vendorName = req.nextUrl.searchParams.get("vendor") as string;
    const type = req.nextUrl.searchParams.get("type") as string;

    if (!status) {
      return new NextResponse("Missing status", { status: 400 });
    }

    let conditions = {};
    // check if filter provided

    
    if (type && type !== "all") {
      conditions = { ...conditions, type };
    }

    if (status) {
      conditions = { ...conditions, status };
    }
    if (code) {
      conditions = { ...conditions, code: { contains: code } };
    }
    if (buyerName) {
      conditions = { ...conditions, buyer: { name: { contains: buyerName } } };
    }
    if (vendorName) {
      conditions = {
        ...conditions,
        purchaseOrders: {
          some: {
            vendor: {
              name: {
                contains: vendorName,
              },
            },
          },
        },
      };
    }

    const quotations = await db.quotation.findMany({
      include: {
        buyer: true,
        _count: {
          select: { purchaseOrders: true, lists: true, medias: true },
        },
      },
      where: {
        // or where
        ...conditions,
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
