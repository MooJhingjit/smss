"use client";
import React from "react";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder, PurchaseOrderPaymentType } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";
import { paymentTypeMapping } from "@/app/config";

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
      const paymentType = item.paymentType as PurchaseOrderPaymentType;
      return <p className="">{paymentTypeMapping[paymentType]}</p>;
    },
  },
  {
    name: "จำนวนเงิน",
    key: "totalPrice",
  },
];

export default function Tasks(props: Readonly<Props>) {
  const { data } = props;
  const { onOpen } = usePurchaseModal();

  return (
    <CardWrapper title="งานที่ต้องตรวจสอบ">
      <TableLists<QuotationWithBuyer>
        columns={columns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}
