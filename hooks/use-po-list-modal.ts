import { PurchaseOrderItemWithRelations } from "@/types";
import { PurchaseOrderItem } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: PurchaseOrderItemWithRelations | null;
  onOpen: (data?: PurchaseOrderItemWithRelations | null) => void;
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
