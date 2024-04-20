import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateCode } from "@/lib/utils";
import {
  groupQuotationByVendor,
  calculateQuotationItemPrice,
} from "@/app/services/service.quotation";
import { QuotationListWithRelations } from "@/types";

// PUT /api/quotations/:id
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // get all quotation items
    const quotationLists = await db.quotationList.findMany({
      where: {
        quotationId: body.quotationId,
      },
      include: {
        product: true,
      },
    });

    // group quotation lists by vendor
    const quotationListsByVendor = groupQuotationByVendor(
      quotationLists as QuotationListWithRelations[]
    );

    // const { sumTotalPrice, sumDiscount, sumTotalTax, grandTotal } =
    //   summarizeQuotationTotalPrice(quotationListsByVendor);

    // const { totalPrice, tax, discount } = calculateQuotationItemPrice(quotationLists)

    // create purchase orders for each vendor
    const purchaseOrders = await Promise.all(
      Object.keys(quotationListsByVendor).map(async (vendorId) => {
        const lists = quotationListsByVendor[Number(vendorId)];

        // all lists are from the same vendor
        const { totalCost } = calculateQuotationItemPrice(lists);

        const PO_tax = 0; // totalCost * 0.03;
        const PO_vat = totalCost * 0.07;
        const purchaseOrder = await db.purchaseOrder.create({
          data: {
            code: "DRAFT-PO-" + Math.floor(Math.random() * 1000000),
            vendorId: Number(vendorId),
            quotationId: body.quotationId,
            price: totalCost,
            grandTotal: totalCost - PO_tax + PO_vat,
            tax: PO_tax,
            vat: PO_vat,
            status: "draft",
          },
        });

        // update code based on purchaseOrder ID
        const code = generateCode(purchaseOrder.id, "PO");
        await db.purchaseOrder.update({
          where: { id: purchaseOrder.id },
          data: { code },
        });

        return purchaseOrder;
      })
    );

    const quotationSummary = calculateQuotationItemPrice(quotationLists)

    // update total price, tax and total discount for quotation
    await db.quotation.update({
      where: { id: body.quotationId },
      data: {
        totalPrice: quotationSummary.totalPrice,
        discount: quotationSummary.discount,
        tax: quotationSummary.tax,
        grandTotal: quotationSummary.grandTotal,
      },
    });

    // generate purchase order items
    const res = await Promise.all(
      purchaseOrders.map(async (purchaseOrder) => {
        const quotationLists = quotationListsByVendor[purchaseOrder.vendorId];

        return Promise.all(
          quotationLists.map(
            async (quotationList: QuotationListWithRelations) => {
              const purchaseOrderItem = await db.purchaseOrderItem.create({
                data: {
                  purchaseOrderId: purchaseOrder.id,
                  name: quotationList.product.name,
                  quantity: quotationList.quantity,
                  description: quotationList.product.description,
                  unit: quotationList.product.unit,
                  price:
                    (quotationList.cost ?? 0) * (quotationList.quantity ?? 1),
                  unitPrice: quotationList.cost,
                  type: quotationList.product.type,
                  status: "pending",
                },
              });

              // generate Items based on purchaseOrder item quantity
              if (quotationList.product.type === "product") {
                await Promise.all(
                  Array.from({ length: purchaseOrderItem.quantity ?? 1 }).map(
                    async () =>
                      await db.item.create({
                        data: {
                          productId: quotationList.productId ?? 0,
                          purchaseOrderItemId: purchaseOrderItem.id,
                          name: quotationList.product.name,
                          cost: quotationList.cost,
                        },
                      })
                  )
                );
              }

              return purchaseOrderItem;
            }
          )
        );
      })
    );

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
