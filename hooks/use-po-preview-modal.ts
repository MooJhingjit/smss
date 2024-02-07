import { PurchaseOrderPreview } from "@/types";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: PurchaseOrderPreview[] | null;
  queryKey: (string | number)[];
  quotationId: number;
  onOpen: (data: PurchaseOrderPreview[], queryKey: (string | number)[], quotationId: number) => void;
  onClose: () => void;
};

export const usePurchasePreviewModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  queryKey: [],
  quotationId: 0,
  onOpen: (data, queryKey, quotationId) =>
    set({
      isOpen: true,
      data: data ?? null,
      queryKey,
      quotationId,
    }),
  onClose: () => set({ isOpen: false }),
}));
