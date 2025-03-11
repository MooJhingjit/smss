import { db } from "@/lib/db";

export const updatePurchaseOrderSummary = async (purchaseOrderId: number) => {
  // get all purchase order items and sum the total price
  const purchaseOrderItems = await db.purchaseOrderItem.findMany({
    where: {
      purchaseOrderId,
    },
  });

  const totalPrice = purchaseOrderItems.reduce(
    (acc, item) => acc + (item.price ?? 0),
    0
  );

  const PO_tax = 0;
  const PO_vat = totalPrice * 0.07;

  // update total price, tax and total discount for quotation
  await db.purchaseOrder.update({
    where: { id: purchaseOrderId },
    data: {
      price: totalPrice,
      totalPrice: totalPrice,
      grandTotal: totalPrice - PO_tax + PO_vat,
      tax: PO_tax,
      vat: PO_vat,
    },
  });
};
