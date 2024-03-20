"use client";
import React from "react";
import { usePurchaseOrderModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";
import { PurchaseOrder, PurchaseOrderPaymentType } from "@prisma/client";
import TableLists from "@/components/table-lists";
import { QuotationWithBuyer } from "@/types";
import { paymentTypeMapping, quotationStatusMapping } from "@/app/config";

type Props = {
  data: QuotationWithBuyer[];
};

const columns = [
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
      return <p className="">
        {new Date(item.updatedAt).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>;
    }
  },
];

export default function Tasks(props: Readonly<Props>) {
  const { data } = props;
  const { onOpen } = usePurchaseOrderModal();

  return (
    <CardWrapper title={`งานที่ต้องตรวจสอบ สถานะ: ${quotationStatusMapping['offer'].label}`}>
      <TableLists<QuotationWithBuyer>
        columns={columns}
        data={data}
        link="/quotations"
      />
    </CardWrapper>
  );
}
