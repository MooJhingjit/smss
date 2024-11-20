import {
    PurchaseOrderWithRelations,
  } from "@/types";
  import { create } from "zustand";
  
  type Store = {
    isOpen: boolean;
    data: PurchaseOrderWithRelations | null;
    onOpen: (
      data: PurchaseOrderWithRelations,
    ) => void;
    onClose: () => void;
  };
  
  export const usePurchaseOrderSummaryModal = create<Store>((set) => ({
    isOpen: false,
    data: null,
    refs: undefined,
    onOpen: (data) =>
      set({
        isOpen: true,
        data: data ?? null,
      }),
    onClose: () => set({ isOpen: false }),
  }));
  