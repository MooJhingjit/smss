"use client";
import React from "react";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";

type Props = {
  data: QuotationWithBuyer[];
};

const columns = [
  { name: "Code", key: "code" },
  {
    name: "Buyer", key: "buyer.name",
    render: (item: QuotationWithBuyer) => {
      return (
        <div className="">
          {item.buyer.name}
        </div>
      );
    },
  },
  { name: "Payment", key: "paymentType" },
  {
    name: "Total Price",
    key: "totalPrice",
  }
  
  
];

export default function Tasks(props: Readonly<Props>) {
  const { data } = props;
  const { onOpen } = usePurchaseModal();

  return (
    <CardWrapper
      title="งานที่ต้องตรวจสอบ"
    >
      <TableLists<QuotationWithBuyer>
        columns={columns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}