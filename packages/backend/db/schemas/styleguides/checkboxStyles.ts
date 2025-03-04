import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const checkboxStyles = pgTable("checkbox_styles", {
  id: serial().primaryKey(),
  backgroundColor: varchar().notNull(),
  border: varchar().notNull(),
  height: varchar().notNull(),
  width: varchar().notNull(),
  cursor: varchar().notNull(),
  borderRadius: varchar().notNull(),
  checkedBorder: varchar().notNull(),
  checkedColor: varchar().notNull(),
  checkedBackgroundColor: varchar().notNull(),
  checkedAlternateBorder: varchar().notNull(),
  checkedAlternateColor: varchar().notNull(),
  checkedAlternateBackgroundColor: varchar().notNull(),
});
