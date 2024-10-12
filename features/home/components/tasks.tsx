"use client";
import React from "react";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";
import { quotationStatusMapping } from "@/app/config";
import PaymentBadge from "@/components/badges/payment-badge";

type Props = {
  data: QuotationWithBuyer[];
  label: string;
};

const taskColumns = [
  { name: "รหัส", key: "code" },
  {
    name: "ลูกค้า",
    key: "buyer.name",
    render: (item: QuotationWithBuyer) => {
      return <div className="">{item.contact.name}</div>;
    },
  },
  // {
  //   name: "รหัสพนักงาน",
  //   key: "sellerId",
  //   render: (item: QuotationWithBuyer) => {
  //     const paymentType = item.paymentType as PurchaseOrderPaymentType;
  //     return <p className="">{paymentTypeMapping[paymentType]}</p>;
  //   },
  // },
  {
    name: "การชำระเงิน",
    key: "paymentType",
    render: (item: QuotationWithBuyer) => {
      const paymentType = item.paymentType
      return <PaymentBadge paymentType={paymentType} paymentDue={item.paymentDue ?? ""} />;
    },
  },
  {
    name: "อัพเดทล่าสุด",
    key: "updatedAt",
    render: (item: QuotationWithBuyer) => {
      return (
        <p className="">
          {new Date(item.updatedAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      );
    },
  },
];

export default function Tasks(props: Readonly<Props>) {
  const { data, label } = props;
  // const { onOpen } = usePurchaseOrderModal();

  return (
    <CardWrapper title={label} actionNeed>
      <TableLists<QuotationWithBuyer>
        columns={taskColumns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}
