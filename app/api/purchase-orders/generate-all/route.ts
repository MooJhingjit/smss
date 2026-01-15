import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentDateTime } from "@/lib/utils";
import { findAvailablePOSequences, generateCode } from "@/lib/generate-code.service";
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

    // Use custom date if provided, otherwise use current date
    // customDate allows regenerating POs with the original date after rollback
    const targetDate = body.customDate 
      ? new Date(body.customDate) 
      : getCurrentDateTime();

    // Get the number of POs we need to create
    const vendorCount = Object.keys(quotationListsByVendor).length;

    // Find available sequence slots for all POs (handles gaps from deleted POs)
    const availableSlots = await findAvailablePOSequences(targetDate, vendorCount);

    // Validate we have enough slots available
    if (availableSlots.length < vendorCount) {
      return NextResponse.json(
        { 
          error: "ไม่สามารถสร้างใบสั่งซื้อได้ เนื่องจากไม่มีเลขที่เอกสารว่างในระบบ กรุณาติดต่อผู้ดูแลระบบ",
          details: `Required ${vendorCount} slots, found ${availableSlots.length}`
        },
        { status: 400 }
      );
    }

    // create purchase orders for each vendor
    const purchaseOrders = await Promise.all(
      Object.keys(quotationListsByVendor).map(async (vendorId, index) => {
        const lists = quotationListsByVendor[Number(vendorId)];

        // all lists are from the same vendor
        const { totalCost: totalPrice } = calculateQuotationItemPrice(lists);

        const PO_tax = 0;
        const PO_vat = totalPrice * 0.07;
        
        // Use the pre-calculated available slot for this PO
        // This ensures no duplicate codes even when regenerating with custom date
        // Note: slot.codeDate is used ONLY for generating the code (year/month)
        //       targetDate is used for createdAt/updatedAt to maintain consistency
        const slot = availableSlots[index];
        const code = generateCode(
          0, // ID parameter is unused in the function
          "PO",
          slot.codeDate,
          slot.sequence
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
            createdAt: targetDate,
            updatedAt: targetDate,
          },
        });

        return purchaseOrder;
      })
    );

    // get quotation
    const quotation = await db.quotation.findUnique({
      select: {
        vatIncluded: true,
      },
      where: {
        id: body.quotationId,
      },
    });

    const quotationSummary = calculateQuotationItemPrice(quotationLists, quotation?.vatIncluded);

    // update total price, tax and total discount for quotation
    await db.quotation.update({
      where: { id: body.quotationId },
      data: {
        totalPrice: quotationSummary.totalPrice,
        discount: quotationSummary.discount,
        tax: quotationSummary.vat,
        grandTotal: quotationSummary.grandTotal,
        approvedAt: targetDate,
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
                  order: quotationList.order,
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
