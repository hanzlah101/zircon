import { createServerActionProcedure, ZSAError } from "zsa";
import { validateRequest } from "./auth/validate-request";

export const authProcedure = createServerActionProcedure().handler(async () => {
  const { user } = await validateRequest();

  if (!user || !user.emailVerified) {
    throw new ZSAError("NOT_AUTHORIZED", "Unauthorized");
  }

  return { user };
});

export const adminProcedure = createServerActionProcedure().handler(
  async () => {
    const { user } = await validateRequest();

    if (!user || !user.emailVerified || user.role === "customer") {
      throw new ZSAError("NOT_AUTHORIZED", "Unauthorized");
    }

    return { user };
  },
);
