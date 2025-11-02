import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { users } from "./users";

export const teamMembers = pgTable("team_members", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
});
