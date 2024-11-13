"use client";
import { quotationStatusMapping, quotationTypeMapping } from "@/app/config";
import DataInfo from "@/components/data-info";
import { useQuotationInfoModal } from "@/hooks/use-quotation-info-modal";
import {  Quotation } from "@prisma/client";
import React from "react";

type Props = {
  data: Quotation;
};


export default function QuotationInfo(props: Readonly<Props>) {
  const modal = useQuotationInfoModal();
  const { data } = props;
  return (
    <DataInfo
      header={`QT: ${data.code}`}
      lists={[
        { label: "ประเภท", value: quotationTypeMapping[data.type] },
        { label: "สถานะ", value: quotationStatusMapping[data.status].label },
        { label: "วิธีการชำระเงิน", value: data.paymentType },
        { label: "ระยะเวลาการส่งมอบ", value: `${data.deliveryPeriod ?? "-"} วัน` },
        { label: "ระยะเวลาการยืนราคา", value:`${data.validPricePeriod ?? "-"} วัน` },
        { label: "อ้างอิงใบสั่งซื้อ", value: data.purchaseOrderRef ?? "" },
      ]}
      onEdit={() => modal.onOpen(data)}
    />
  );
}
