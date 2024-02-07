"use client";

import { useEffect, useState } from "react";

import { NewQuotationModal } from "@/components/modals/modal-quotation";
import { NewPurchaseModal } from "@/components/modals/modal.purchase";
import { NewProductModal } from "../modals/modal.product";
import { ProductItemModal } from "../modals/modal.product-items";
import { NewUserModal } from "../modals/modal.user";
import { ItemModal } from "../modals/item-modal";
import { QuotationListModal } from "../modals/modal.quotation-list";
import { PurchasePreviewModal } from "../modals/modal.purchase-preview";

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
      <ItemModal />
      <QuotationListModal />
      <PurchasePreviewModal />
      {/* <ProductItemModal /> */}
      <NewProductModal />
      <NewQuotationModal />
      <NewPurchaseModal />
    </>
  );
};
