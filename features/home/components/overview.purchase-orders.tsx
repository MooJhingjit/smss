"use client";
import React from "react";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder, PurchaseOrderPaymentType, PurchaseOrderStatus } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { paymentTypeMapping, purchaseOrderStatusMapping } from "@/app/config";
import { PurchaseOrderWithVendor } from "../admin.page";
import StatusBadge from "@/components/badges/status-badge";
import PaymentBadge from "@/components/badges/payment-badge";

type Props = {
  data: PurchaseOrderWithVendor[];
};

const columns = [
  { name: "รหัส", key: "code" },
  {
    name: "ผู้ขาย/ร้านค้า",
    key: "vendorId",
    render: (item: PurchaseOrderWithVendor) => {
      return <p>{item.vendor.name}</p>;
    },
  },
  { name: "จำนวนเงิน", key: "totalPrice" },
  {
    name: "การชำระเงิน",
    key: "paymentType",
    render: (item: PurchaseOrderWithVendor) => {
      const paymentType = item.paymentType as PurchaseOrderPaymentType;
      return <PaymentBadge paymentType={paymentType} />
    },
  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: PurchaseOrder) => {
      return (
        <StatusBadge status={purchaseOrderStatusMapping[item.status]}

          isWarning={item.status === PurchaseOrderStatus.product_received}
          isSuccess={item.status === PurchaseOrderStatus.paid} />

      );
    },
  },
];

export default function PurchaseOrders(props: Readonly<Props>) {
  const { data } = props;
  const { onOpen } = usePurchaseOrderModal();

  return (
    <CardWrapper
      title="ใบสั่งซื้อ (PO)"
      description="5 รายการที่มีการเปลี่ยนแปลงล่าสุด"
      onCreate={onOpen}
    >
      <TableLists<PurchaseOrderWithVendor>
        columns={columns}
        data={data}
        link="/purchase-orders"
      />
    </CardWrapper>
  );
}
