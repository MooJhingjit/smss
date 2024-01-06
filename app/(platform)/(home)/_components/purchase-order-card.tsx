"use client";
import React from "react";
import { usePurchaseModal } from "@/hooks/use-po-modal";
import CardWrapper from "./card-wrapper";

export default function PurchaseOrders() {
  const { onOpen } = usePurchaseModal();

  return (
    <CardWrapper
      title="Purchase orders "
      description="Recents to 5 purchase orders ordered by date"
      onCreate={onOpen}
    />
  );
}
