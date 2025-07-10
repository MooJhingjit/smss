import { create } from "zustand";

type QuotationContactData = {
  id: number;
  overrideContactName?: string | null;
  overrideContactEmail?: string | null;
  overrideContactPhone?: string | null;
};

type Store = {
  isOpen: boolean;
  data: QuotationContactData | null;
  onOpen: (data: QuotationContactData) => void;
  onClose: () => void;
};

export const useQuotationContactModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) =>
    set({
      isOpen: true,
      data: data,
    }),
  onClose: () => set({ isOpen: false }),
}));
