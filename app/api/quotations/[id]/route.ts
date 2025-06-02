import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { QuotationStatus } from "@prisma/client";

// PUT /api/quotations/:id
export async function PUT(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    // console.log("req.query", req.query);
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // body whitelist
    const bodyWhitelist = [
      "status",
      "purchaseOrderRef",
      "paymentDue",
      "paymentType",
      "deliveryPeriod",
      "validPricePeriod",
      "type",
      "code",
      "paymentCondition",
      "createdAt" // updage version
    ];

    // check if body has any keys that are not in the whitelist
    const body = await req.json();
    const bodyKeys = Object.keys(body);
    const hasInvalidBody = bodyKeys.some((key) => !bodyWhitelist.includes(key));
    if (hasInvalidBody) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const data: any = {
      ...body,
    }

    // if status is offer, set approvedAt to now
    if (data.status === QuotationStatus.offer) {
      data.approvedAt = new Date();
    }


    const quotation = await db.quotation.update({
      where: {
        id: Number(id),
      },
      data,
    });
    return NextResponse.json(quotation);
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// delete 
export async function DELETE(
  req: NextRequest,
  context: { params: { id: number } }
) {
  try {
    const { id } = context.params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const quotationId = Number(id);

    // First, check if the quotation exists and get its related data
    const quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: {
        purchaseOrders: {
          include: {
            purchaseOrderItems: {
              include: {
                items: true,
                purchaseOrderItemReceipt: true,
              },
            },
            medias: true,
          },
        },
        lists: {
          include: {
            QuotationItems: true,
          },
        },
        medias: true,
        invoice: {
          include: {
            billGroup: true,
          },
        },
      },
    });

    if (!quotation) {
      return new NextResponse("Quotation not found", { status: 404 });
    }

    // Start transaction to delete all related data (including purchase orders)
    await db.$transaction(async (tx) => {
      // 1. Delete all purchase order related data first
      for (const po of quotation.purchaseOrders) {
        // 1a. Delete items associated with purchase order items
        for (const poItem of po.purchaseOrderItems) {
          if (poItem.items.length > 0) {
            await tx.item.deleteMany({
              where: {
                purchaseOrderItemId: poItem.id,
              },
            });
          }
          
          // 1b. Delete purchase order item receipts
          // if (poItem.purchaseOrderItemReceipt) {
          //   await tx.purchaseOrderItemReceipt.delete({
          //     where: {
          //       id: poItem.purchaseOrderItemReceipt.id,
          //     },
          //   });
          // }
        }

        // 1c. Delete purchase order items
        if (po.purchaseOrderItems.length > 0) {
          await tx.purchaseOrderItem.deleteMany({
            where: {
              purchaseOrderId: po.id,
            },
          });
        }

        // 1d. Delete purchase order medias
        if (po.medias.length > 0) {
          await tx.media.deleteMany({
            where: {
              purchaseOrderId: po.id,
            },
          });
        }

        // 1e. Delete the purchase order itself
        await tx.purchaseOrder.delete({
          where: {
            id: po.id,
          },
        });
      }

      // 2. Delete QuotationItems (they reference QuotationList)
      for (const list of quotation.lists) {
        if (list.QuotationItems.length > 0) {
          await tx.quotationItem.deleteMany({
            where: {
              quotationListId: list.id,
            },
          });
        }
      }

      // 3. Delete QuotationLists
      if (quotation.lists.length > 0) {
        await tx.quotationList.deleteMany({
          where: {
            quotationId: quotationId,
          },
        });
      }

      // 4. Delete quotation medias
      if (quotation.medias.length > 0) {
        await tx.media.deleteMany({
          where: {
            quotationId: quotationId,
          },
        });
      }

      // 5. Delete invoice and handle bill group
      if (quotation.invoice) {
        const billGroupId = quotation.invoice.billGroupId;
        
        // Delete the invoice first
        await tx.invoice.delete({
          where: {
            quotationId: quotationId,
          },
        });

        // Check if the bill group has any other invoices or quotations
        const billGroupUsage = await tx.billGroup.findUnique({
          where: { id: billGroupId },
          include: {
            invoices: true,
            quotations: true,
          },
        });

        // If the bill group is empty, delete it
        if (billGroupUsage && 
            billGroupUsage.invoices.length === 0 && 
            billGroupUsage.quotations.length === 1 && // This quotation will be deleted next
            billGroupUsage.quotations[0].id === quotationId) {
          await tx.billGroup.delete({
            where: {
              id: billGroupId,
            },
          });
        }
      }

      // 6. Finally, delete the quotation itself
      await tx.quotation.delete({
        where: {
          id: quotationId,
        },
      });
    });

    return NextResponse.json({ 
      message: "Quotation and all related data deleted successfully" 
    });
  } catch (error) {
    console.log("error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
