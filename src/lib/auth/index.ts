import { Lucia } from "lucia";
import { Google, Facebook } from "arctic";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "@/db";
import { env } from "@/env";
import { sessions, users } from "@/db/schema";
import { SITE_URL } from "../constants";

import type { User as DatabaseUser } from "@/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "scents-auth.session-token",
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getUserAttributes: ({ passwordHash: _, ...rest }) => {
    return rest;
  },
  getSessionAttributes() {
    return {};
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${SITE_URL}/api/auth/google/callback`,
);

export const facebook = new Facebook(
  env.FACEBOOK_CLIENT_ID,
  env.FACEBOOK_CLIENT_SECRET,
  `${SITE_URL}/api/auth/facebook/callback`,
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUser;
    DatabaseSessionAttributes: {
      ipAddress: string;
      userAgent: string;
    };
  }
}
