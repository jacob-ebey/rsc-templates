import { relations } from "drizzle-orm";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const users = table(
  "users",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    firstName: t.text(),
    lastName: t.text(),
    email: t.text().notNull(),
    invitee: t.int().references((): t.AnySQLiteColumn => users.id),
    role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)]
);

export const userRelations = relations(users, ({ one }) => ({
  invitee: one(users, {
    fields: [users.invitee],
    references: [users.id],
  }),
}));
