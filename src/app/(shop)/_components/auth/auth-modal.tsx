"use client";

import { Modal, ModalContent } from "@/components/ui/modal";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "lucia";
import {
  authModalTypes,
  useAuthModal,
  type AuthModalType,
} from "@/stores/use-auth-modal";

import { LoginForm } from "./login-form";
import { SignUpForm } from "./sign-up-form";
import { VerifyOTPForm } from "./verify-otp-form";

type AuthModalProps = {
  user: User | null;
};

export function AuthModal({ user }: AuthModalProps) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const initialModalType = searchParams.get("modal") as AuthModalType | null;

  const { isOpen, onOpen, onOpenChange, type } = useAuthModal();

  useEffect(() => {
    if (!!initialModalType && authModalTypes.includes(initialModalType)) {
      onOpen(initialModalType);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("modal");
      router.push(`${window.location.pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      });
    }
  }, [initialModalType, searchParams, onOpen, router]);

  const content = useMemo(() => {
    switch (type) {
      case "signup":
        if (user) return null;
        return <SignUpForm />;
      case "login":
        if (user) return null;
        return <LoginForm />;
      case "verify-otp":
        if (!user || user.emailVerified) return null;
        return <VerifyOTPForm user={user} />;
      // TODO: reset password & google/facebook login
      default:
        return null;
    }
  }, [type, user]);

  if (content === null) return null;

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={type}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
            className="w-full md:space-y-4"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </ModalContent>
    </Modal>
  );
}
