"use client";
import React from "react";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder, PurchaseOrderPaymentType } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { PurchaseOrderWithVendor } from "../page";
import { paymentTypeMapping } from "@/app/config";

type Props = {
  data: PurchaseOrderWithVendor[];
};



const columns = [
  { name: "รหัส", key: "code" },
  {
    name: "ผู้ขาย", key: "vendorId",
    render: (item: PurchaseOrderWithVendor) => {
      return (
        <p>{item.vendor.name}</p>
      );
    },
  },
  { name: "จำนวนเงิน", key: "totalPrice" },
  {
    name: "ประเภทการชำระเงิน",
    key: "paymentType",
    render: (item: PurchaseOrderWithVendor) => {
      const paymentType = item.paymentType as PurchaseOrderPaymentType
      return <p className="">{paymentTypeMapping[paymentType]}</p>;
    },
  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: PurchaseOrder) => {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
          {item.status}
        </span>
      );
    },
  },
];

export default function PurchaseOrders(props: Readonly<Props>) {
  const { data } = props;
  const { onOpen } = usePurchaseModal();

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
