"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signIn } from "@/actions/auth/auth.actions";
import { useServerAction } from "@/hooks/use-server-action";
import { signInSchema, SignInSchema } from "@/validators/auth.validators";
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { StatusButton } from "@/components/ui/status-button";
import { onFormError } from "@/lib/errors";
import { useAuthModal } from "@/stores/use-auth-modal";
import { Button } from "@/components/ui/button";
import {
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

export function LoginForm() {
  const { setType, onClose } = useAuthModal();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isPending, mutate, status } = useServerAction(signIn, {
    onError: onFormError(form),
    onSuccess: ({ isVerified }) => {
      if (!isVerified) {
        setType("verify-otp");
        toast.success("Check your email", {
          description: "We've sent you a 6-digit verification code",
        });
      } else {
        onClose();
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => mutate(values));

  return (
    <>
      <ModalHeader>
        <Logo />
        <ModalTitle className="pt-3">Login to your account</ModalTitle>
        <ModalDescription>
          Find your perfect scent in our exquisite collection of perfumes
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <Form {...form}>
          <FormError />
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      autoComplete="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="password"
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StatusButton
              type="submit"
              status={status}
              successMessage="Logged in"
            >
              Login
            </StatusButton>
          </form>
        </Form>
      </ModalBody>

      <ModalFooter className="flex items-center justify-center gap-1 text-center text-sm sm:justify-center sm:text-center">
        Don&apos;t have an account?{" "}
        <Button size={"fit"} variant={"link"} onClick={() => setType("signup")}>
          Create
        </Button>
      </ModalFooter>
    </>
  );
}
