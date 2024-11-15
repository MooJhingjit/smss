import { PurchaseOrderWithRelations } from "@/types";
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
  data: PurchaseOrderWithRelations | null;
  onOpen: (data?: PurchaseOrderWithRelations) => void;
  onClose: () => void;
};

export const usePurchaseOrderInfoModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) =>
    set({
      isOpen: true,
      data: data || null,
    }),
  onClose: () => set({ isOpen: false }),
}));
