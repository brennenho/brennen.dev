import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `brennen.dev_${name}`);

export const pastes = createTable(
  "pastes",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    fileName: varchar("fileName", { length: 256 }),
    text: text("text").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.fileName),
  }),
);
