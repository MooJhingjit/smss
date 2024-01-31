import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationList } from "@prisma/client";
import { generateCode } from "@/lib/utils";

// PUT /api/quotations/:id
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("bodyKeys", body.quotationId)

    // get all quotation items from quotationId
    const quotationLists = await db.quotationList.findMany({
      where: {
        quotationId: body.quotationId
      },
      include: {
        product: true
      }
    })

    // group quotation lists by vendor
    const quotationListsByVendor = quotationLists.reduce<{ [key: number]: QuotationList[] }>((acc, curr) => {
      if (!acc[curr.product.vendorId]) {
        acc[curr.product.vendorId] = []
      }
      acc[curr.product.vendorId].push(curr)
      return acc
    }, {})

    // create  purchase orders for each vendor
    const purchaseOrders = await Promise.all(Object.keys(quotationListsByVendor).map(async (vendorId) => {
      const purchaseOrder = await db.purchaseOrder.create({
        data: {
          code: "DRAFT-PO-" + Math.floor(Math.random() * 1000000),
          vendorId: Number(vendorId),
          quotationId: body.quotationId,
          status: "draft"
        }
      })

      // update code based on purchaseOrder ID
      const code = generateCode(purchaseOrder.id, "PO");
      await db.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { code },
      });

      return purchaseOrder
    }))

    // generate purchase order items
    await Promise.all(purchaseOrders.map(async (purchaseOrder) => {
      const quotationLists = quotationListsByVendor[purchaseOrder.vendorId]
      return Promise.all(quotationLists.map(async (quotationList: QuotationList) => {
        const purchaseOrderItem = await db.purchaseOrderItem.create({
          data: {
            purchaseOrderId: purchaseOrder.id,
            name: quotationList.name,
            price: quotationList.price,
            quantity: quotationList.quantity,
            status: 'pending'
          }
        })
        return purchaseOrderItem
      }))
    }))

    // // get all purchase orders
    // const purchaseOrdersWithItems = await db.purchaseOrder.findMany({
    //   where: {
    //     quotationId: body.quotationId
    //   },
    //   include: {
    //     purchaseOrderItems: true
    //   }
    // })
   
    return new NextResponse(null, {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
