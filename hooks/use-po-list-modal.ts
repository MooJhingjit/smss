import { PurchaseOrderItem } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: PurchaseOrderItem | null;
  onOpen: (data?: PurchaseOrderItem | null) => void;
  onClose: () => void;
};

export const usePurchaseOrderListModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) =>
    set({
      isOpen: true,
      data: data ?? null,
    }),
  onClose: () => set({ isOpen: false }),
}));
