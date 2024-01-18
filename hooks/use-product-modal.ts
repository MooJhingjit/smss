import { ProductWithRelations } from "@/types";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: ProductWithRelations | null;
  onOpen: (data?: ProductWithRelations) => void;
  onClose: () => void;
};

export const useProductModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({
    isOpen: true,
    data: data || null,
  }),
  onClose: () => set({ isOpen: false }),
}));
