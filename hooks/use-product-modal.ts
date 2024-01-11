import { Product } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: Product | null;
  onOpen: (data?: Product) => void;
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
