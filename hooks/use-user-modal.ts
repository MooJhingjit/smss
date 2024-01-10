import { User } from "@prisma/client";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  data: User | null;
  onOpen: (data?: User) => void;
  onClose: () => void;
};

export  const useUserModal = create<Store>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({ 
    isOpen: true,
    data: data || null,
  }),
  onClose: () => set({ isOpen: false }),
}));
