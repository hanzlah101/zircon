"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUp } from "@/actions/auth/auth.actions";
import { useServerAction } from "@/hooks/use-server-action";
import { signUpSchema, SignUpSchema } from "@/validators/auth.validators";
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

export function SignUpForm() {
  const { setType } = useAuthModal();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isPending, mutate, status } = useServerAction(signUp, {
    onError: onFormError(form),
    onSuccess: () => {
      setType("verify-otp");
      toast.success("Check your email", {
        description: "We've sent you a 6-digit verification code",
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => mutate(values));

  return (
    <>
      <ModalHeader>
        <Logo />
        <ModalTitle className="pt-3">Welcome to Scents</ModalTitle>
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
              name="name"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      autoComplete="name"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
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

            <FormField
              control={form.control}
              name="confirmPassword"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="password"
                      type="password"
                      placeholder="Confirm your password"
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
              successMessage="Check your email"
            >
              Sign Up
            </StatusButton>
          </form>
        </Form>
      </ModalBody>

      <ModalFooter className="flex flex-row items-center justify-center gap-1 text-sm sm:justify-center sm:text-center">
        Already have an account?{" "}
        <Button size={"fit"} variant={"link"} onClick={() => setType("login")}>
          Sign in
        </Button>
      </ModalFooter>
    </>
  );
}
