import { create } from "zustand";

export const authModalTypes = [
  "login",
  "signup",
  "verify-otp",
  "reset-password",
] as const;

export type AuthModalType = (typeof authModalTypes)[number];

type AuthModalStore = {
  isOpen: boolean;
  onOpen: (type: AuthModalType) => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  type: AuthModalType;
  setType: (type: AuthModalType) => void;
};

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  type: "signup",
  onOpen: (type) => set({ isOpen: true, type }),
  onClose: () => set({ isOpen: false }),
  onOpenChange: (isOpen) => set({ isOpen }),
  setType: (type) => set({ type }),
}));
