export const routeName = {
  purchaseOrders: "purchase-orders",
  quotations: "quotations",
  users: "users",
  products: "products",
};

export const quotationStatusMapping = {
  open: {
    label: "เปิด Quotation",
    progress: 10,
  },
  pending_approval: {
    label: "รออนุมัติ Quotation",
    progress: 20,
  },
  offer: {
    label: "พร้อมส่ง Quotation ให้ลูกค้า",
    progress: 30,
  },
  approved: {
    label: "ลูกค้าอนุมัติ Quotation แล้ว",
    progress: 40,
  },
  po_preparing: {
    label: "เตรียม Purchase Order (ผู้ขาย/ร้านค้า)",
    progress: 50,
  },
  po_sent: {
    label: "ส่ง Purchase Order (ผู้ขาย/ร้านค้า)",
    progress: 60,
  },
  product_received: {
    label: "รับสินค้าแล้ว",
    progress: 70,
  },
  order_preparing: {
    label: "รอส่งสินค้า",
    progress: 80,
  },
  delivered: {
    label: "ส่งสินค้าแล้ว/รอชำระเงิน",
    progress: 90,
  },
  paid: {
    label: "ชำระเงินแล้ว/ปิดงาน",
    progress: 100,
  },
  archived: {
    label: "Archived",
    progress: 0,
  },
};

export const paymentTypeMapping = {
  cash: "เงินสด",
  credit: "เครดิต",
};

export const purchaseOrderStatusMapping = {
  draft: "กำลังตรวจสอบ",
  po_sent: "ส่ง Purchase Order แล้ว",
  product_received: "รับสินค้าแล้ว/รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
};

export const purchaseOrderItemStatusMapping = {
  pending: "รอสินค้า",
  confirmed: "รับสินค้า",
};

export const quotationTypeMapping = {
  product: "สินค้า",
  service: "บริการ",
};
export const productTypeMapping = {
  product: "สินค้า",
  service: "บริการ",
};

