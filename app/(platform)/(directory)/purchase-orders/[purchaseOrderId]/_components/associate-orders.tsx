"use client";
import React from "react";
import { Plus } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import { PurchaseOrderWithRelations } from "@/types";
import TableLists from "@/components/table-lists";
import { purchaseOrderColumns } from "../..";

export default function AssociateOrders({
  data,
  quotationCode,
}: {
  data: PurchaseOrderWithRelations[];
  quotationCode: string;
}) {
  return (
    <PageComponentWrapper
      headerIcon={
        <Plus
          onClick={usePurchaseOrderModal().onOpen}
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700"
        />
      }
      headerTitle={`รายการสั่งซื้ออื่นๆ สำหรับ ${quotationCode}`}
    >
      <div className="overflow-x-scroll">
        <TableLists<PurchaseOrderWithRelations>
          // remove vendor name
          columns={purchaseOrderColumns.filter((i) => i.key !== "name")}
          data={data}
        />
      </div>
    </PageComponentWrapper>
  );
}
