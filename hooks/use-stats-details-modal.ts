import { create } from "zustand";

export type StatsDetailsTab = "paid" | "unpaid" | "installment";

type Payload = {
  year: number;
  month: number; // 0-11
  monthLabel: string;
  initialTab?: StatsDetailsTab;
  profit?: number;
};

type Store = {
  isOpen: boolean;
  data?: Payload;
  onOpen: (payload: Payload) => void;
  onClose: () => void;
};

export const useStatsDetailsModal = create<Store>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (payload) => set({ isOpen: true, data: payload }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
