"use client";
import { quotationStatusMapping } from "@/app/config";
import DataInfo from "@/components/data-info";
import React from "react";
import {
  PurchaseOrderPaymentType,
} from "@prisma/client";
import { purchaseOrderStatusMapping } from "@/app/config";
import { PurchaseOrderWithRelations } from "@/types";
import { usePurchaseOrderInfoModal } from "@/hooks/use-po-info-modal";


type Props = {
  data: PurchaseOrderWithRelations;
};


export default function PurchaseOrderInfo(props: Readonly<Props>) {
  const modal = usePurchaseOrderInfoModal();
  const { data } = props;

  const quotationStatus = data.quotation?.status;

  let lists = []

  lists.push({ label: "สถานะ (PO)", value: purchaseOrderStatusMapping[data.status] })

  if (quotationStatus) {
    lists.push({ label: "สถานะ (QT)", value: quotationStatusMapping[quotationStatus].label })
  }
  lists.push({
    label: "การชำระเงิน", value: <PaymentLabel
      paymentType={data.paymentType}
      paymentDue={data.paymentDue}
    />
  })

  return (
    <DataInfo
      variant="gray"
      header={`PO: ${data.code}`}
      lists={lists}
      onEdit={() => modal.onOpen(data)}
    />
  );
}


const PaymentLabel = (props: { paymentType: PurchaseOrderPaymentType, paymentDue: Date | null }) => {
  const { paymentType, paymentDue } = props;
  if (paymentType === PurchaseOrderPaymentType.cash) {
    return "เงินสด"
  }
  return (
    <div className="flex items-center space-x-2">
      <span>เครดิต</span>
      <span className="text-xs text-gray-400">กำหนดชำระ {paymentDue?.toDateString()}</span>
    </div>
  )
}