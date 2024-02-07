"use client";
import React from "react";
import { Plus, FileEdit } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import { PurchaseOrderWithRelations } from "@/types";
import { getDateFormat } from "@/lib/utils";
import Link from "next/link";
import TableLists from "@/components/table-lists";

const columns = [
  { name: "Code", key: "code" },
  {
    name: "Vendor", key: "name",
    render: (item: PurchaseOrderWithRelations) => {
      return item.vendor?.name;
    },
  },
  { name: "Discount", key: "totalDiscount" },
  { name: "Total Price", key: "totalPrice" },
  {
    name: "Created", key: "createdAt",
    render: (item: PurchaseOrderWithRelations) => {
      return getDateFormat(item.createdAt)
    },
  },
  {
    name: "Status", key: "status",
    render: (item: PurchaseOrderWithRelations) => {
      return (
        <Link
          href={`/purchases/${item.id}`}
          className="flex space-x-1  font-semibold items-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
          <span>{item.status}</span>
          <FileEdit className="w-3 h-3 text-orange-400 cursor-pointer hover:text-orange-700" />
        </Link>
      );
    },
  },
];


export default function AssociateOrders({ data, quotationCode }: { data: PurchaseOrderWithRelations[], quotationCode: string }) {
  return (
    <PageComponentWrapper
      headerIcon={
        <Plus
          onClick={usePurchaseModal().onOpen}
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
        />
      }
      headerTitle={`รายการสั่งซื้ออื่นๆ สำหรับ ${quotationCode}`}
    >
      <div className="overflow-x-scroll">
        <TableLists<PurchaseOrderWithRelations>
          columns={columns}
          data={data}
        />
      </div>
    </PageComponentWrapper>
  );
}
