export const routeName = {
  purchaseOrders: "purchase-orders",
  quotations: "quotations",
  users: "users",
  products: "products",
};

export const quotationStatusMapping = {
  open: {
    label: "เปิด QT",
    progress: 10,
  },
  pending_approval: {
    label: "รออนุมัติ QT",
    progress: 20,
  },
  offer: {
    label: "รอส่ง QT (ให้ลูกค้า)",
    progress: 30,
  },
  approved: {
    label: "ลูกค้าอนุมัติ QT แล้ว",
    progress: 40,
  },
  po_preparing: {
    label: "เตรียม PO (ผู้ขาย)",
    progress: 50,
  },
  po_sent: {
    label: "ส่ง PO (ผู้ขาย)",
    progress: 60,
  },
  product_received: {
    label: "รับสินค้า",
    progress: 70,
  },
  order_preparing: {
    label: "รอส่งสินค้า",
    progress: 80,
  },
  delivered: {
    label: "ส่งสินค้า / ปิดงาน",
    progress: 90,
  },
};

export const paymentTypeMapping = {
  cash: "เงินสด",
  credit: "เครดิต",
};

export const purchaseOrderStatusMapping = {
  draft: "กำลังตรวจสอบ",
  // open: "เปิด PO",
  // preparing: "เตรียมสินค้า",
  // sent: "ส่งสินค้า",
  // delivered: "ส่งสินค้า / ปิดงาน",
};

export const purchaseOrderItemStatusMapping = {
  pending: "รอสินค้า",
  confirmed: "รับสินค้า",
};

export const quotationTypeMapping = {
  product: "สินค้า",
  service: "บริการ",
};
