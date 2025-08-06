import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  generateCode,
  getCurrentDateTime,
  parseSequenceNumber,
} from "@/lib/utils";
import {
  groupQuotationByVendor,
  calculateQuotationItemPrice,
} from "@/app/services/service.quotation";
import { QuotationListWithRelations } from "@/types";
import { ProductType } from "@prisma/client";

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

    // const today = new Date(Date.UTC(2025, 1, 1));
    // const today = new Date();
    const today = getCurrentDateTime();

    // 1) Find the most recently created PO (descending by code)
    // that starts with prefix + year + month.
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const lastPO = await db.purchaseOrder.findFirst({
      where: {
        code: {
          startsWith: `PO${year}${month}`,
        },
      },
      orderBy: {
        code: "desc",
      },
    });

    // 2) Parse the last 4 digits to figure out the sequence number
    let nextSequence = parseSequenceNumber(lastPO?.code ?? "");

    // create purchase orders for each vendor
    const purchaseOrders = await Promise.all(
      Object.keys(quotationListsByVendor).map(async (vendorId, index) => {
        const lists = quotationListsByVendor[Number(vendorId)];

        // all lists are from the same vendor
        const { totalCost: totalPrice } = calculateQuotationItemPrice(lists);

        const PO_tax = 0;
        const PO_vat = totalPrice * 0.07;
        
        // Generate a unique code for this purchase order
        // Use the current sequence number + index to ensure uniqueness across vendors
        const currentSequence = nextSequence + index;
        const code = generateCode(
          0, // ID parameter is unused in the function
          "PO",
          today,
          currentSequence
        );

        const purchaseOrder = await db.purchaseOrder.create({
          data: {
            code,
            vendorId: Number(vendorId),
            quotationId: body.quotationId,
            price: totalPrice,
            totalPrice: totalPrice,
            grandTotal: totalPrice - PO_tax + PO_vat,
            tax: PO_tax,
            vat: PO_vat,
            status: "draft",
            createdAt: today,
            updatedAt: today,
          },
        });

        return purchaseOrder;
      })
    );

    const quotationSummary = calculateQuotationItemPrice(quotationLists);

    // update total price, tax and total discount for quotation
    await db.quotation.update({
      where: { id: body.quotationId },
      data: {
        totalPrice: quotationSummary.totalPrice,
        discount: quotationSummary.discount,
        tax: quotationSummary.vat,
        grandTotal: quotationSummary.grandTotal,
        approvedAt: today,
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
                  quotationListId: quotationList.id, // Link to quotation list
                  name: quotationList.name, // changed to use from list
                  quantity: quotationList.quantity,
                  description: quotationList.description, // changed to use from list
                  unit: quotationList.product.unit,
                  price:
                    (quotationList.cost ?? 0) * (quotationList.quantity ?? 1),
                  unitPrice: quotationList.cost,
                  type: quotationList.productType as ProductType,
                  status: "pending",
                },
              });

              // generate Items based on purchaseOrder item quantity
              if (quotationList.productType === "product") {
                await Promise.all(
                  Array.from({ length: purchaseOrderItem.quantity ?? 1 }).map(
                    async () =>
                      await db.item.create({
                        data: {
                          productId: quotationList.productId ?? 0,
                          purchaseOrderItemId: purchaseOrderItem.id,
                          name: quotationList.name, // changed to use from list
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
