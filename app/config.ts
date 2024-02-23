export const routeName = {
  purchaseOrders: "purchase-orders",
  quotations: "quotations",
  users: "users",
  products: "products",
}

export const quotationStatusMapping = {
  open: "เปิด QT",
  offer: "ส่ง QT (ให้ลูกค้า)",
  approved: "อนุมัติ QT",
  po_preparing: "เตรียม PO (ผู้ขาย)",
  po_sent: "ส่ง PO (ผู้ขาย)",
  product_received: "รับสินค้า",
  order_preparing: "รอส่งสินค้า",
  delivered: "ส่งสินค้า / ปิดงาน"
}

export const paymentTypeMapping = {
  cash: "เงินสด",
  credit: "เครดิต",
}

export const purchaseOrderStatusMapping = {
  draft: "กำลังตรวจสอบ",
  // open: "เปิด PO",
  // preparing: "เตรียมสินค้า",
  // sent: "ส่งสินค้า",
  // delivered: "ส่งสินค้า / ปิดงาน",
}

export const purchaseOrderItemStatusMapping = {
  pending: "รอสินค้า",
  confirmed: "รับสินค้า",
}