"use client";
import { useContactModal } from "@/hooks/use-contact-modal";
import { Contact } from "@prisma/client";
import React from "react";
import DataInfo from "@/components/data-info";

type Props = {
  data: Contact;
};

export default function CustomerInfo(props: Readonly<Props>) {
  const modal = useContactModal();
  const { data } = props;
  return (
    <DataInfo
      variant="yellow"
      columnClassName="grid-cols-1  sm:grid-cols-3"
      header={`ลูกค้า: ${data.name}`}
      lists={[
        { label: "เลขประจำตัวผู้เสียภาษี", value: data.taxId ?? "" },
        { label: "สาขา", value: `${data.branchId ?? ""}` },
        { label: "โทร", value: data.phone ?? "" },
        { label: "อีเมล์", value: data.email },
        { label: "ที่อยู่", value: `${data.address ?? ""}` },
      ]}
      onEdit={() => modal.onOpen(data)}
    />

   
  );
}

