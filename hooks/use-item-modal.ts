import { ItemRefs, ItemWithRefs } from "@/types";
import { Item } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: Item | null;
  refs: ItemRefs;
  onOpen: (data?: Item | null, refs?: ItemRefs | null) => void;
  onClose: () => void;
};

export const useItemModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  refs: undefined,
  onOpen: (data, refs) =>
    set({
      isOpen: true,
      data: data ?? null,
      refs: refs ?? undefined,
    }),
  onClose: () => set({ isOpen: false }),
}));
