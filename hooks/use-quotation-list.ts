import { QuotationList } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: QuotationList | null;
  onOpen: (data?: QuotationList) => void;
  onClose: () => void;
};

export const useQuotationListModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({
    isOpen: true,
    data: data || null,
  }),
  onClose: () => set({ isOpen: false }),
}));
