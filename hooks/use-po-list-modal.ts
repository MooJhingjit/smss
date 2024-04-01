import {
  PurchaseOrderItemWithRelations,
  PurchaseOrderWithRelations,
} from "@/types";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: PurchaseOrderItemWithRelations | null;
  refs?: PurchaseOrderWithRelations;
  onOpen: (
    data?: PurchaseOrderItemWithRelations | null,
    refs?: PurchaseOrderWithRelations | null,
  ) => void;
  onClose: () => void;
};

export const usePurchaseOrderListModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  refs: undefined,
  onOpen: (data, refs) =>
    set({
      isOpen: true,
      data: data ?? null,
      refs: refs ?? undefined,
    }),
  onClose: () => set({ isOpen: false }),
}));
