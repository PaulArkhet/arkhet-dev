import {
  pgTable,
  varchar,
  boolean,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { users as usersTable } from "./users";
import type { InferSelectModel } from "drizzle-orm";

export const datasets = pgTable("datasets", {
  datasetId: serial("dataset_id").primaryKey(),
  userId: varchar("user_id")
    .references(() => usersTable.userId, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title").notNull(),
  content: varchar("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export type Dataset = InferSelectModel<typeof datasets>;
