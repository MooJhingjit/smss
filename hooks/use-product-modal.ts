import { ProductWithVender } from "@/types";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: ProductWithVender | null;
  onOpen: (data?: ProductWithVender) => void;
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
