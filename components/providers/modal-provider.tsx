"use client";

import { useEffect, useState } from "react";

import { NewQuotationModal } from "@/components/modals/new-quotation-modal";

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
      <NewQuotationModal />
    </>
  )
}