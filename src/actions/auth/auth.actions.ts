"use server";

import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { Scrypt } from "lucia";
import {
  emailSchema,
  otpSchema,
  passwordResetSchema,
  signInSchema,
  signUpSchema,
} from "@/validators/auth.validators";

import { and, eq } from "drizzle-orm";
import { createServerAction, ZSAError } from "zsa";
import {
  createSession,
  generatePasswordResetToken,
  generateVerificationCode,
} from "./auth.service";

import { createId } from "@paralleldrive/cuid2";
import { onUniqueConstraintError } from "@/lib/errors";
import { sendEmail } from "@/lib/send-email";
import { validateRequest } from "@/lib/auth/validate-request";
import { isWithinExpirationDate } from "oslo";
import { lucia } from "@/lib/auth";

import VerificationEmail from "@emails/verification-email";
import PasswordResetEmail from "@emails/password-reset-email";
import { SITE_URL } from "@/lib/constants";

export const signUp = createServerAction()
  .input(signUpSchema)
  .onError(onUniqueConstraintError("User already exists with this email"))
  .handler(async ({ input }) => {
    const passwordHash = await new Scrypt().hash(input.password);

    const userId = createId();

    await db.insert(users).values({ id: userId, passwordHash, ...input });

    const code = await generateVerificationCode(userId);

    await sendEmail({
      to: input.email,
      subject: "Confirm your email address",
      react: VerificationEmail({ code }),
    });

    await createSession(userId);
  });

export const signIn = createServerAction()
  .input(signInSchema)
  .handler(async ({ input }) => {
    const { email, password } = input;

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        emailVerified: users.emailVerified,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new ZSAError("FORBIDDEN", "Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new ZSAError(
        "FORBIDDEN",
        "This account is linked to a social provider",
      );
    }

    const isPasswordValid = await new Scrypt().verify(
      user.passwordHash,
      password,
    );

    if (!isPasswordValid) {
      throw new ZSAError("FORBIDDEN", "Invalid email or password");
    }

    if (!user.emailVerified) {
      const code = await generateVerificationCode(user.id);

      await sendEmail({
        to: email,
        subject: "Confirm your email address",
        react: VerificationEmail({ code }),
      });
    }

    await createSession(user.id);

    return { isVerified: user.emailVerified };
  });

export const resendVerificationCode = createServerAction().handler(async () => {
  const { user } = await validateRequest();

  if (!user || user.emailVerified) {
    throw new ZSAError("NOT_AUTHORIZED", "Unauthorized");
  }

  const code = await generateVerificationCode(user.id);

  await sendEmail({
    to: user.email,
    subject: "Confirm your email address",
    react: VerificationEmail({ code }),
  });
});

export const verifyOtp = createServerAction()
  .input(otpSchema)
  .handler(async ({ input }) => {
    const { user, session } = await validateRequest();

    if (!user || !session || user.emailVerified) {
      throw new ZSAError("NOT_AUTHORIZED", "Unauthorized");
    }

    const [verificationToken] = await db
      .select({
        id: verificationTokens.id,
        type: verificationTokens.type,
        expiresAt: verificationTokens.expiresAt,
      })
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.userId, user.id),
          eq(verificationTokens.token, input.code),
        ),
      );

    if (!verificationToken) {
      throw new ZSAError("FORBIDDEN", "Invalid otp code");
    }

    if (!isWithinExpirationDate(verificationToken.expiresAt)) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verificationToken.id));

      throw new ZSAError("FORBIDDEN", "Invalid otp code");
    }

    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, user.id));

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, verificationToken.id));

    await lucia.invalidateSession(session.id);
    await createSession(user.id);
  });

export const sendPasswordResetLink = createServerAction()
  .input(emailSchema)
  .handler(async ({ input: { email } }) => {
    const [user] = await db

      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email));

    const token = await generatePasswordResetToken(user.id);

    const url = `${SITE_URL}/?modal=reset-password&token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      react: PasswordResetEmail({ name: user.name, url }),
    });
  });

export const resetPassword = createServerAction()
  .input(passwordResetSchema)
  .handler(async ({ input }) => {
    const { token, password } = input;

    const [verificationToken] = await db
      .select({
        id: verificationTokens.id,
        type: verificationTokens.type,
        expiresAt: verificationTokens.expiresAt,
        userId: verificationTokens.userId,
      })
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token));

    if (!verificationToken || verificationToken.type !== "reset_password") {
      throw new ZSAError("FORBIDDEN", "Token invalid or expired");
    }

    if (!isWithinExpirationDate(verificationToken.expiresAt)) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.id, verificationToken.id));

      throw new ZSAError("FORBIDDEN", "Token invalid or expired");
    }

    const passwordHash = await new Scrypt().hash(password);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, verificationToken.userId));

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, verificationToken.id));

    await lucia.invalidateUserSessions(verificationToken.userId);
    await createSession(verificationToken.userId);
  });
