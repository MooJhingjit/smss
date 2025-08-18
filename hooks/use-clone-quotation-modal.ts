import { create } from "zustand";
import { QuotationWithRelations } from "@/types";

interface CloneQuotationModalStore {
  isOpen: boolean;
  data?: QuotationWithRelations;
  onOpen: (data: QuotationWithRelations) => void;
  onClose: () => void;
}

export const useCloneQuotationModal = create<CloneQuotationModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
