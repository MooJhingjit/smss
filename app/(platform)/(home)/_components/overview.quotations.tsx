"use client";
import React from "react";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import CardWrapper from "./card-wrapper";
import { QuotationWithBuyer } from "@/types";
import TableLists from "@/components/table-lists";
import { paymentTypeMapping, quotationStatusMapping } from "@/app/config";
import { PurchaseOrderPaymentType } from "@prisma/client";

type Props = {
  data: QuotationWithBuyer[];
};

const columns = [
  { name: "รหัส", key: "code" },
  {
    name: "ลูกค้า",
    key: "buyer.name",
    render: (item: QuotationWithBuyer) => {
      return <div className="">{item.buyer.name}</div>;
    },
  },
  {
    name: "ประเภทการชำระเงิน",
    key: "paymentType",
    render: (item: QuotationWithBuyer) => {
      const paymentType = item.paymentType as PurchaseOrderPaymentType
      return <p className="">{paymentTypeMapping[paymentType]}</p>;
    },
  },

  {
    name: "สถานะ",
    key: "status",
    render: (item: QuotationWithBuyer) => {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
          {
            quotationStatusMapping[item.status]
          }
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
      title="ใบเสนอราคา (Quotation)"
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
