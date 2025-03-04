import type { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: varchar("user_id").primaryKey(),
  email: varchar("email").notNull(),
  username: varchar("username").notNull(),
  profilePictureSrc: varchar("profile_picture_src"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export type User = InferSelectModel<typeof users>;
