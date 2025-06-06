import { QuotationListWithRelations } from "@/types";
import { QuotationType } from "@prisma/client";
import { create } from "zustand";

export type ItemRefs =
  | undefined
  | {
      productRef?: { id: number; name: string };
      quotationRef: { id: number; type: QuotationType; isLocked?: boolean };
      timestamps: number;
    };

type Store = {
  isOpen: boolean;
  data: QuotationListWithRelations | null;
  refs: ItemRefs | null;
  onOpen: (data?: QuotationListWithRelations, refs?: ItemRefs) => void;
  onClose: () => void;
};

export const useQuotationListModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  refs: null,
  onOpen: (data, refs) =>
    set({
      isOpen: true,
      data: data ?? null,
      refs: refs ?? null,
    }),
  onClose: () => set({ isOpen: false }),
}));
