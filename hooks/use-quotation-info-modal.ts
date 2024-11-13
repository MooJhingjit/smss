import { QuotationWithRelations } from "@/types";
import { PurchaseOrderPaymentType, Quotation } from "@prisma/client";
import { create } from "zustand";

// type DataProps = {
//   data: Quotation;
//   isAdmin: boolean;
//   hasList: boolean;
//   paymentType: PurchaseOrderPaymentType;
//   paymentDue: string;
// };

type Store = {
  isOpen: boolean;
  data: QuotationWithRelations | null;
  onOpen: (data?: QuotationWithRelations) => void;
  onClose: () => void;
};

export const useQuotationInfoModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) =>
    set({
      isOpen: true,
      data: data || null,
    }),
  onClose: () => set({ isOpen: false }),
}));
