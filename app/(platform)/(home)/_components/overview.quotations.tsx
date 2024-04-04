"use client";
import React from "react";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import CardWrapper from "./card-wrapper";
import { QuotationWithBuyer } from "@/types";
import TableLists from "@/components/table-lists";
import { paymentTypeMapping, quotationStatusMapping } from "@/app/config";
import { PurchaseOrderPaymentType } from "@prisma/client";
import CodeBadge from "@/components/badges/code-badge";
import PaymentBadge from "@/components/badges/payment-badge";
import StatusBadge from "@/components/badges/status-badge";

type Props = {
  data: QuotationWithBuyer[];
};

const columns = [
  {
    name: "รหัส", key: "code",
    render: (item: QuotationWithBuyer) => {
      return <CodeBadge code={item.code} isLocked={item.isLocked} />;
    }
  },
  {
    name: "ลูกค้า",
    key: "buyer.name",
    render: (item: QuotationWithBuyer) => {
      return <div className="">{item.contact.name}</div>;
    },
  },
  {
    name: "การชำระเงิน",
    key: "paymentType",
    render: (item: QuotationWithBuyer) => {
      const paymentType = item.paymentType as PurchaseOrderPaymentType;
      return <PaymentBadge paymentType={paymentType} />;
    },
  },

  {
    name: "สถานะ",
    key: "status",
    render: (item: QuotationWithBuyer) => {
      return (
        <StatusBadge status={quotationStatusMapping[item.status].label}/>
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
