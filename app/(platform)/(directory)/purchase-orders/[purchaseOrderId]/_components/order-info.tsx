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
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";


type Props = {
  data: PurchaseOrderWithRelations;
};


export default function PurchaseOrderInfo(props: Readonly<Props>) {
  const modal = usePurchaseOrderInfoModal();
  const { data } = props;

  const quotationStatus = data.quotation?.status;

  let lists = []

  lists.push({ label: "สถานะ (PO)", value: purchaseOrderStatusMapping[data.status] })

  let QT_label = "QT"
  if (quotationStatus) {
    QT_label = `${QT_label} (${quotationStatusMapping[quotationStatus].label})`
  }
  
  lists.push({
    label: QT_label , value:
      data.quotation ? (
        <Link href={`/quotations/${data.quotation.id}`} target="_blank" className="flex items-center space-x-2">
          <span>{data.quotation.code}</span>
          <ExternalLinkIcon className="w-4 h-4 text-blue-500" />
        </Link>
      ) : "-"

  })

  lists.push({
    label: "การชำระเงิน", value: <PaymentLabel
      paymentType={data.paymentType}
      paymentDue={data.paymentDue}
    />
  })

  lists.push({ label: "เลขใบเสนอราคา", value: data.vendorQtCode ?? "-" })

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