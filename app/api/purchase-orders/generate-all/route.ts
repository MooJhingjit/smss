import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationList } from "@prisma/client";
import { generateCode } from "@/lib/utils";
import { getQuotationGroupByVendor, getQuotationTotalPrice } from "@/lib/quotation.helper";
import { QuotationListWithRelations } from "@/types";


// PUT /api/quotations/:id
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
    const quotationListsByVendor = getQuotationGroupByVendor(quotationLists as QuotationListWithRelations[])

    let sumTotalPrice: number = 0;
    let sumTotalDiscount: number = 0;
    let sumTotalTax: number = 0

    // create purchase orders for each vendor
    const purchaseOrders = await Promise.all(Object.keys(quotationListsByVendor).map(async (vendorId) => {

      const vendorIdNum = Number(vendorId)
      const lists = quotationListsByVendor[vendorIdNum]
      const { totalCost, totalPrice, totalDiscount, totalTax } = getQuotationTotalPrice(lists)

      // summary of total price, tax and total discount for quotation
      sumTotalPrice += totalPrice
      sumTotalDiscount += totalDiscount
      sumTotalTax += totalTax

      const purchaseOrder = await db.purchaseOrder.create({
        data: {
          code: "DRAFT-PO-" + Math.floor(Math.random() * 1000000),
          vendorId: Number(vendorId),
          quotationId: body.quotationId,
          totalPrice: totalCost,
          totalDiscount,
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

    // update total price, tax and total discount for quotation
    await db.quotation.update({
      where: { id: body.quotationId },
      data: {
        totalPrice: sumTotalPrice,
        totalDiscount: sumTotalDiscount,
        totalTax: sumTotalTax,
      },
    });


    // generate purchase order items
    const res = await Promise.all(purchaseOrders.map(async (purchaseOrder) => {
      const quotationLists = quotationListsByVendor[purchaseOrder.vendorId]
      return Promise.all(quotationLists.map(async (quotationList: QuotationListWithRelations) => {
        const purchaseOrderItem = await db.purchaseOrderItem.create({
          data: {
            purchaseOrderId: purchaseOrder.id,
            name: quotationList.product.name,
            price: quotationList.cost,
            quantity: quotationList.quantity,
            status: 'pending'
          }
        })

        // generate Items based on purchaseOrder item quantity
        await Promise.all(Array.from({ length: purchaseOrderItem.quantity ?? 1 }).map(async () => (
          await db.item.create({
            data: {
              productId: quotationList.productId ?? 0,
              purchaseOrderItemId: purchaseOrderItem.id,
              name: quotationList.product.name,
              cost: quotationList.cost,
            }
          })
        )))

        return purchaseOrderItem
      }))
    }))


    // lock quotation
    await db.quotation.update({
      where: { id: body.quotationId },
      data: { isLocked: true },
    });

    // return success message
    return NextResponse.json(res);

  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
