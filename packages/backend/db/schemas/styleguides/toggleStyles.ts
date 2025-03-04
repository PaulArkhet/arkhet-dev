import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const toggleStyles = pgTable("toggle_styles_config", {
  id: serial().primaryKey(),
  isChecked: boolean().notNull(),
  checkedBackgroundColor: varchar().notNull(),
  uncheckedBackgroundColor: varchar().notNull(),
  checkedButtonColor: varchar().notNull(),
  uncheckedButtonColor: varchar().notNull(),
  checkedBorderColor: varchar().notNull(),
  uncheckedBorderColor: varchar().notNull(),
  checkedThumbSize: varchar().notNull(),
  uncheckedThumbSize: varchar().notNull(),
  styleJSON: varchar().notNull(),
  borderRadius: varchar().notNull(),
});
