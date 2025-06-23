import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const users = table(
  "users",
  {
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: t.text(),
    email: t.text().notNull(),
    role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
    hashedPassword: t.text().notNull(),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)]
);
