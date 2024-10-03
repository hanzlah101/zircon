import { db } from "@/db";
import { verificationTokens } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { cookies, headers } from "next/headers";
import { userAgent } from "next/server";
import { createDate, TimeSpan } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

function getIP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

function gerUserAgent() {
  const ua = userAgent({ headers: headers() });
  return [
    `${ua.browser?.name || "Unknown Browser"} ${ua.browser?.version || ""}`,
    `on ${ua.os?.name || "Unknown OS"} ${ua.os?.version || ""}`,
    `(${ua.device?.type || "Desktop"})`,
  ]
    .join(" ")
    .trim();
}

export async function createSession(userId: string) {
  const session = await lucia.createSession(userId, {
    ipAddress: getIP(),
    userAgent: gerUserAgent(),
  });

  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
}

export async function generateVerificationCode(userId: string) {
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.userId, userId));

  const code = generateRandomString(6, alphabet("0-9"));

  await db.insert(verificationTokens).values({
    userId,
    token: code,
    type: "verify_email",
    expiresAt: createDate(new TimeSpan(15, "m")),
  });

  return code;
}

export async function generatePasswordResetToken(userId: string) {
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.userId, userId));

  const token = generateId(40);

  await db.insert(verificationTokens).values({
    userId,
    token,
    expiresAt: createDate(new TimeSpan(2, "h")),
    type: "reset_password",
  });

  return token;
}
