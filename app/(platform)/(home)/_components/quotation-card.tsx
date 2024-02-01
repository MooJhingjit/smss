"use client";
import React from "react";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import CardWrapper from "./card-wrapper";
import { QuotationWithBuyer } from "@/types";
import TableLists from "@/components/table-lists";

type Props = {
  data: QuotationWithBuyer[];
};

const columns = [
  { name: "Code", key: "code" },
  { name: "Buyer", key: "buyer.name" },
  { name: "Payment", key: "paymentType" },
  {
    name: "Status",
    key: "status",
    render: (item: QuotationWithBuyer) => {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
          {item.status}
        </span>
      );
    },
  },
];

export default function Quotations(props: Readonly<Props>) {
  const { onOpen } = useQuotationModal();
  const { data } = props;
  return (
    <CardWrapper
      title="ใบเสนอราคา"
      description="5 รายการที่มีการเปลี่ยนแปลงล่าสุด"
      onCreate={onOpen}
      link="/quotations"
    >
      <TableLists<QuotationWithBuyer>
        columns={columns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}
