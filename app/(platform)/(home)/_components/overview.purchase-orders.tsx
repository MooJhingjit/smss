"use client";
import React from "react";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { PurchaseOrderWithVendor } from "../page";

type Props = {
  data: PurchaseOrderWithVendor[];
};



const columns = [
  { name: "Code", key: "code" },
  {
    name: "Vendor", key: "vendorId",
    render: (item: PurchaseOrderWithVendor) => {
      return (
        <p>{item.vendor.name}</p>
      );
    },
  },
  { name: "Total Price", key: "totalPrice" },
  { name: "Payment Type", key: "paymentType" },
  {
    name: "Status",
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
      title="ใบสั่งซื้อ"
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
