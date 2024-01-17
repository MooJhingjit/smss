import { Item } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: Item | null;
  onOpen: (data?: Item) => void;
  onClose: () => void;
};

export const useItemModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({
    isOpen: true,
    data: data || null,
  }),
  onClose: () => set({ isOpen: false }),
}));
