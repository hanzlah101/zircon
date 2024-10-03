import { create } from "zustand";

type BagModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (open: boolean) => void;
};

export const useBagModal = create<BagModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onOpenChange: (isOpen) => set({ isOpen }),
}));
