"use client";

import { useEffect, useState } from "react";

import { NewQuotationModal } from "@/components/modals/new-quotation-modal";
import { NewPurchaseModal } from "@/components/modals/new-purchase-modal";
import { NewProductModal } from "../modals/new-product-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewProductModal />
      <NewQuotationModal />
      <NewPurchaseModal />
    </>
  )
}