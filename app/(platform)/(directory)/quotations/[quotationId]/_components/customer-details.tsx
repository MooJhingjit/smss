"use client";
import { useContactModal } from "@/hooks/use-contact-modal";
import { Contact } from "@prisma/client";
import React from "react";
import DataInfo from "@/components/data-info";
import { useQuotationContactModal } from "@/hooks/use-quotation-contact-modal";

type Props = {
  quotationId: number;
  data: Contact;
};

export default function CustomerInfo(props: Readonly<Props>) {
  const modal = useQuotationContactModal();

  const { quotationId, data } = props;
  return (
    <DataInfo
      variant="yellow"
      columnClassName="grid-cols-1  sm:grid-cols-3"
      header={`ลูกค้า: ${data.name}`}
      lists={[
        { label: "เลขประจำตัวผู้เสียภาษี", value: data.taxId ?? "" },
        { label: "สาขา", value: `${data.branchId ?? ""}` },
        { label: "ที่อยู่", value: `${data.address ?? ""}` },
        { label: "ผู้ติดต่อ", value: data.contact },
        { label: "โทร", value: data.phone ?? "" },
        { label: "อีเมล์", value: data.email },
      ]}
      onEdit={() => modal.onOpen({
        id: quotationId,
        overrideContactName: data.contact ?? null,
        overrideContactEmail: data.email ?? null,
        overrideContactPhone: data.phone ?? null,
      })}
      actionLabel="แก้ไขข้อมูลผู้ติดต่อ"
    />

   
  );
}

