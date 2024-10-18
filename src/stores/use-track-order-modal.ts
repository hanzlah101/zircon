import { create } from "zustand";

type TrackOrderModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
};

export const useTrackOrderModal = create<TrackOrderModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  onOpenChange: (isOpen) => set({ isOpen }),
}));
