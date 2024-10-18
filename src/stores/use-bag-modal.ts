import { create } from "zustand";

type BagModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
};

export const useBagModal = create<BagModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  onOpenChange: (isOpen) => set({ isOpen }),
}));
