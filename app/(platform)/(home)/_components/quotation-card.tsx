'use client';
import React from "react";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import CardWrapper from "./card-wrapper";

export default function Quotations() {
  const { onOpen } = useQuotationModal();

  return (
    <CardWrapper
      title="Quotations"
      description="Recents to 5 quotations ordered by date"
      onCreate={onOpen}
    />
  );
}
