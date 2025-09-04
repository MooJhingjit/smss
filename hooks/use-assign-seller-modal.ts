import { create } from "zustand";
import { QuotationWithRelations } from "@/types";

interface AssignSellerModalStore {
  isOpen: boolean;
  data?: QuotationWithRelations;
  onOpen: (data: QuotationWithRelations) => void;
  onClose: () => void;
}

export const useAssignSellerModal = create<AssignSellerModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
