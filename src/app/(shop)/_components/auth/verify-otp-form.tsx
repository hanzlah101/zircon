"use client";

import { resendVerificationCode, verifyOtp } from "@/actions/auth/auth.actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

import { useServerAction } from "@/hooks/use-server-action";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { useCountdown } from "usehooks-ts";
import { useAuthModal } from "@/stores/use-auth-modal";
import type { User } from "lucia";

type VerifyOTPFormProps = {
  user: User;
};

export function VerifyOTPForm({ user }: VerifyOTPFormProps) {
  const [count, { startCountdown }] = useCountdown({
    countStart: 60,
  });

  const { onClose } = useAuthModal();

  const { mutate: verify, isPending: isVerifying } = useServerAction(
    verifyOtp,
    {
      onError: (err) => toast.error(getErrorMessage(err)),
      onSuccess: () => {
        toast.success("Email verified successfully!");
        onClose();
      },
    },
  );

  const { mutate: resend, isPending: isResending } = useServerAction(
    resendVerificationCode,
    {
      onError: (err) => toast.error(getErrorMessage(err)),
      onSuccess: () => {
        startCountdown();
        toast.success("Check your email", {
          description: "We've sent you a 6-digit verification code",
        });
      },
    },
  );

  return (
    <>
      <ModalHeader className="flex flex-col items-center justify-center text-center sm:items-center sm:justify-center sm:text-center">
        <Logo />
        <ModalTitle className="pt-3">Verify your email address</ModalTitle>
        <ModalDescription>
          Enter the 6-digit verification code we sent to{" "}
          <span className="font-semibold text-foreground/70">{user.email}</span>
        </ModalDescription>
      </ModalHeader>

      <ModalBody className="mx-auto !mt-2 flex w-full justify-center">
        <InputOTP
          autoFocus
          maxLength={6}
          disabled={isVerifying}
          onComplete={(code) => verify({ code })}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </ModalBody>

      <ModalFooter className="mt-2 flex items-center justify-center gap-1 text-center text-sm sm:justify-center sm:text-center">
        {count > 0 && count < 60 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in {count} seconds
          </p>
        ) : (
          <Button
            size={"fit"}
            variant={"link"}
            disabled={isVerifying || isResending}
            onClick={() => resend()}
          >
            Didn&apos;t receive a code?
          </Button>
        )}
      </ModalFooter>
    </>
  );
}
