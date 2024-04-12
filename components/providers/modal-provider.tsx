"use client";

import { useEffect, useState } from "react";

import { NewQuotationModal } from "@/components/modals/modal-quotation";
import { NewPurchaseModal } from "@/components/modals/modal.purchase-orders";
import { NewProductModal } from "../modals/modal.product";
import { NewUserModal } from "../modals/modal.user";
import { ItemModal } from "../modals/item-modal";
import { QuotationListModal } from "../modals/modal.quotation-list";
import { PurchasePreviewModal } from "../modals/modal.purchase-preview";
import { PurchaseOrderListModal } from "../modals/modal.po-list";
import { ContactModal } from "../modals/modal.contact";
import { PurchaseOrderReceiptModal } from "../modals/modal.purchase-order-receipt";

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
      <ContactModal />
      <NewUserModal />
      <ItemModal />
      <QuotationListModal />
      <PurchasePreviewModal />
      <NewProductModal />
      <NewQuotationModal />
      <NewPurchaseModal />
      <PurchaseOrderListModal />
      <PurchaseOrderReceiptModal />
    </>
  );
};
