import {
  pgTable,
  varchar,
  integer,
  boolean,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";
import { users as usersTable } from "./users";
import { shapes } from "./shapes/shapes";

export const projects = pgTable("projects", {
  projectId: serial("project_id").primaryKey(),
  userId: varchar("user_id")
    .references(() => usersTable.userId, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title").notNull(),
  imgSrc: varchar("img_src").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  editedAt: timestamp("edited_at").notNull().defaultNow(),
  iterations: integer("iterations").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
});

export type Project = InferSelectModel<typeof projects>;

/* wireframe: varchar()
    .default(
      '[{"id":0,"xOffset":1560,"yOffset":1235.5,"width":800,"height":448,"minWidth":10,"minHeight":10,"isInstanceChild":false,"type":"page","subtype":"Desktop","title":"New Page","description":"Description & documentation - Lorem ipsum dolor sit amet, consectetur adipiscing elit."}]'
    )
    .notNull(), */
