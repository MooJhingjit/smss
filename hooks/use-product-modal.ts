import { ProductWithRelations } from "@/types";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: ProductWithRelations | null;
  onProductCreated?: (product: ProductWithRelations) => void;
  onModalClosed?: () => void;
  onOpen: (data?: ProductWithRelations, onProductCreated?: (product: ProductWithRelations) => void, onModalClosed?: () => void) => void;
  onClose: () => void;
};

export const useProductModal = create<Store>((set, get) => ({
  isOpen: false,
  data: null,
  onProductCreated: undefined,
  onModalClosed: undefined,
  onOpen: (data, onProductCreated, onModalClosed) =>
    set({
      isOpen: true,
      data: data || null,
      onProductCreated: onProductCreated,
      onModalClosed: onModalClosed,
    }),
  onClose: () => {
    const { onModalClosed } = get();
    if (onModalClosed) {
      onModalClosed();
    }
    set({ isOpen: false, onProductCreated: undefined, onModalClosed: undefined });
  },
}));
