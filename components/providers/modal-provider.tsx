"use client";

import { useEffect, useState } from "react";

import { NewQuotationModal } from "@/components/modals/new-quotation-modal";
import { NewPurchaseModal } from "@/components/modals/new-purchase-modal";
import { NewProductModal } from "../modals/new-product-modal";
import { NewItemModal } from "../modals/new-item-modal";
import { NewUserModal } from "../modals/new-user-modal";

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
      <NewUserModal />
      <NewItemModal />
      <NewProductModal />
      <NewQuotationModal />
      <NewPurchaseModal />
    </>
  );
};
