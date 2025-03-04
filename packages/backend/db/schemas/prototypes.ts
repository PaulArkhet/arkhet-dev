import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { projects as projectsTable } from "./projects";

export const prototypes = pgTable("prototypes", {
  prototypeId: serial("prototype_id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projectsTable.projectId, { onDelete: "cascade" })
    .notNull(),
  sourceCode: varchar("source_code").notNull(),
  thumbnailImg: varchar("thumbnail_img"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export type Prototype = InferSelectModel<typeof prototypes>;
