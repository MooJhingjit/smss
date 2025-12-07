import { db } from "@/lib/db";

export const updatePurchaseOrderSummary = async (purchaseOrderId: number) => {
  // get all purchase order items and sum the total price, discount, and extraCost
  const purchaseOrderItems = await db.purchaseOrderItem.findMany({
    where: {
      purchaseOrderId,
    },
  });

  const totalPrice = purchaseOrderItems.reduce(
    (acc, item) => acc + (item.price ?? 0),
    0
  );

  const totalDiscount = purchaseOrderItems.reduce(
    (acc, item) => acc + (item.discount ?? 0),
    0
  );

  const totalExtraCost = purchaseOrderItems.reduce(
    (acc, item) => acc + (item.extraCost ?? 0),
    0
  );

  const priceAfterAdjustments = totalPrice - totalDiscount + totalExtraCost;

  const PO_tax = 0;
  const PO_vat = priceAfterAdjustments * 0.07;

  // update total price, tax and total discount for quotation
  await db.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: {
      price: totalPrice,
      discount: totalDiscount,
      extraCost: totalExtraCost,
      totalPrice: priceAfterAdjustments,
      grandTotal: priceAfterAdjustments - PO_tax + PO_vat,
      tax: PO_tax,
      vat: PO_vat,
    },
  });
};

export const deletePurchaseOrdersByQuotationId = async (quotationId: number) => {
  // Get all purchase orders for this quotation
  const purchaseOrders = await db.purchaseOrder.findMany({
    where: {
      quotationId,
    },
    select: {
      id: true,
    },
  });

  const purchaseOrderIds = purchaseOrders.map((po) => po.id);

  // Delete all purchase order items first (due to foreign key constraint)
  await db.purchaseOrderItem.deleteMany({
    where: {
      purchaseOrderId: {
        in: purchaseOrderIds,
      },
    },
  });

  // Delete all purchase orders
  await db.purchaseOrder.deleteMany({
    where: {
      quotationId,
    },
  });

  // Check if there are any remaining purchase orders for this quotation
  const remainingPurchaseOrders = await db.purchaseOrder.count({
    where: {
      quotationId,
    },
  });

  // If no purchase orders remain, unlock the quotation
  if (remainingPurchaseOrders === 0) {
    await db.quotation.update({
      where: { id: quotationId },
      data: {
        isLocked: false,
      },
    });
  }

  return {
    deletedPurchaseOrders: purchaseOrders.length,
  };
};
