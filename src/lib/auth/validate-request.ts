import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { lucia } from ".";

export const validateRequest = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }

    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();

      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch (error) {
    console.log("Error creating session cookie", error);
  }

  return result;
});

export async function validateAdmin() {
  const { user, session } = await validateRequest();

  if (!user || !session || user.role === "customer") {
    return notFound();
  }

  return { user, session };
}
