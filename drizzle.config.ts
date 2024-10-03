import { env } from "@/env";
import type { Config } from "drizzle-kit";

const config: Config = {
  verbose: true,
  strict: true,
  dialect: "postgresql",
  schema: "src/db/schema.ts",
  out: "src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
};

export default config;
