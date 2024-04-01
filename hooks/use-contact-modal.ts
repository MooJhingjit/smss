import { Contact } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: Contact | null;
  onOpen: (data?: Contact) => void;
  onClose: () => void;
};

export const useContactModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) =>
    set({
      isOpen: true,
      data: data || null,
    }),
  onClose: () => set({ isOpen: false }),
}));
