import { z } from "zod";

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PasswordSchema = z.infer<typeof passwordSchema>;

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
  })
  .and(passwordSchema);

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const otpSchema = z.object({
  code: z
    .string()
    .min(6)
    .max(6)
    .regex(/^[0-9]+$/),
});

export type OtpSchema = z.infer<typeof otpSchema>;

export const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export type EmailSchema = z.infer<typeof emailSchema>;

export const passwordResetSchema = passwordSchema.and(
  z.object({
    token: z.string().min(40).max(40),
  }),
);
