import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: { id: number } },
) {
  try {
    // console.log("req.query", req.query);
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // body whitelist
    const bodyWhitelist = ["status", "paymentDue", "paymentType", "vendorQtCode"];

    // check if body has any keys that are not in the whitelist
    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const purchaseOrder = await db.purchaseOrder.update({
      where: {
        id: Number(id),
      },
      data: {
        ...body,
      },
    });
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/purchase-orders/:id
export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const purchaseOrderId = Number(id);

    // First, get the purchase order with its related data
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        purchaseOrderItems: {
          include: {
            items: true,
            purchaseOrderItemReceipt: true,
          },
        },
        medias: true,
        quotation: {
          include: {
            purchaseOrders: true,
            lists: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return new NextResponse("Purchase order not found", { status: 404 });
    }

    // Start transaction to delete all related data
    await db.$transaction(async (tx) => {
      // 1. Delete items associated with purchase order items
      for (const poItem of purchaseOrder.purchaseOrderItems) {
        if (poItem.items.length > 0) {
          await tx.item.deleteMany({
            where: {
              purchaseOrderItemId: poItem.id,
            },
          });
        }

        // Delete purchase order item receipts if they exist
        // if (poItem.purchaseOrderItemReceipt) {
        //   await tx.purchaseOrderItemReceipt.delete({
        //     where: {
        //       id: poItem.purchaseOrderItemReceipt.id,
        //     },
        //   });
        // }
      }

      // 2. Delete purchase order items
      if (purchaseOrder.purchaseOrderItems.length > 0) {
        await tx.purchaseOrderItem.deleteMany({
          where: {
            purchaseOrderId: purchaseOrderId,
          },
        });
      }

      // 3. Delete purchase order medias
      if (purchaseOrder.medias.length > 0) {
        await tx.media.deleteMany({
          where: {
            purchaseOrderId: purchaseOrderId,
          },
        });
      }

      // 4. Handle quotation logic if this PO is related to a quotation
      if (purchaseOrder.quotation) {
        const quotation = purchaseOrder.quotation;
        const remainingPOs = quotation.purchaseOrders.filter(po => po.id !== purchaseOrderId);

        if (remainingPOs.length === 0) {
          // No other POs exist - reset quotation to unlocked state
          await tx.quotation.update({
            where: { id: quotation.id },
            data: {
              totalPrice: null,
              discount: null,
              tax: null,
              grandTotal: null,
              isLocked: false,
            },
          });
        } else {
          // Other POs exist - delete related quotation lists first, then recalculate

          // Delete quotation lists that are linked to the purchase order items being deleted
          const quotationListIdsToDelete = purchaseOrder.purchaseOrderItems
            .map(poItem => poItem.quotationListId)
            .filter((id): id is number => id !== null); // Filter out null values

          if (quotationListIdsToDelete.length > 0) {
            await tx.quotationList.deleteMany({
              where: {
                id: { in: quotationListIdsToDelete },
              },
            });
          }

          // Recalculate quotation totals with remaining lists
          const updatedQuotation = await tx.quotation.findUnique({
            where: { id: quotation.id },
            include: { lists: true },
          });

          if (updatedQuotation?.lists && updatedQuotation.lists.length > 0) {
            const { calculateQuotationItemPrice } = require("@/app/services/service.quotation");
            const quotationSummary = calculateQuotationItemPrice(updatedQuotation.lists, updatedQuotation.vatIncluded);

            await tx.quotation.update({
              where: { id: quotation.id },
              data: {
                totalPrice: quotationSummary.totalPrice,
                discount: quotationSummary.discount,
                tax: quotationSummary.vat,
                grandTotal: quotationSummary.grandTotal,
                isLocked: true,
              },
            });
          }
        }
      }

      // 5. Finally, delete the purchase order itself
      await tx.purchaseOrder.delete({
        where: {
          id: purchaseOrderId,
        },
      });
    });

    return NextResponse.json({
      message: "Purchase order and all related data deleted successfully"
    });
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
