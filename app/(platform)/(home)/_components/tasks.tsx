"use client";
import React from "react";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";
import { quotationStatusMapping } from "@/app/config";

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
  {
    name: "รหัสพนักงาน",
    key: "sellerId",
    // render: (item: QuotationWithBuyer) => {
    //   const paymentType = item.paymentType as PurchaseOrderPaymentType;
    //   return <p className="">{paymentTypeMapping[paymentType]}</p>;
    // },
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
const paymentDueColumns = [
  { name: "รหัส", key: "code" },
  {
    name: "กำหนดชำระ",
    key: "paymentDue",
    render: (item: QuotationWithBuyer) => {
      const isLate = new Date(item.paymentDue ?? "") < new Date();

      return (
        <p className={isLate ? "text-red-500" : "text-yellow-500"}>
          {new Date(item.paymentDue ?? "").toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      );
    },
  },
  {
    name: "สถานะ",
    key: "status",
    render: (item: QuotationWithBuyer) => {
      return <p className="">{quotationStatusMapping[item.status].label}</p>;
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
    <CardWrapper title={label}>
      <TableLists<QuotationWithBuyer>
        columns={taskColumns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}
