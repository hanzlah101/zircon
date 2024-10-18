import { create } from "zustand";
import type { OrderWithPayment } from "@/db/types";

type EditOrderModalStore = {
  data: OrderWithPayment | null;
  isOpen: boolean;
  onOpen: (data: OrderWithPayment) => void;
  onClose: () => void;
};

export const useEditOrderModal = create<EditOrderModalStore>((set) => ({
  data: null,
  isOpen: false,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));
