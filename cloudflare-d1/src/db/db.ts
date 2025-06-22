import { env } from "cloudflare:workers";

import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error("Database not configured in environment");
  }

  return drizzle(env.DB, { schema });
}
