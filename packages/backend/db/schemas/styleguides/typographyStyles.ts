import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const typographyStyles = pgTable("typography_styles", {
  id: serial().primaryKey(),
  customizationEnabledFont: boolean().notNull(),
  selectedFont: varchar().notNull(),
  h1Size: varchar().notNull(),
  h2Size: varchar().notNull(),
  h3Size: varchar().notNull(),
  h4Size: varchar().notNull(),
  h5Size: varchar().notNull(),
  h6Size: varchar().notNull(),
  paragraphSize: varchar().notNull(),
  linkSize: varchar().notNull(),
  h1Weight: varchar().notNull(),
  h2Weight: varchar().notNull(),
  h3Weight: varchar().notNull(),
  h4Weight: varchar().notNull(),
  h5Weight: varchar().notNull(),
  h6Weight: varchar().notNull(),
  paragraphWeight: varchar().notNull(),
  linkWeight: varchar().notNull(),
});
