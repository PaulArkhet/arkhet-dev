import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const radioButtonStyles = pgTable("radio_button_styles", {
  id: serial().primaryKey(),
  height: varchar().notNull(),
  width: varchar().notNull(),
  borderColor: varchar().notNull(),
  borderWidth: varchar().notNull(),
  borderRadius: varchar().notNull(),
  borderColorChecked: varchar().notNull(),
  color: varchar().notNull(),
  customIconHeight: varchar().notNull(),
  customIconWidth: varchar().notNull(),
  customIconBackgroundColor: varchar().notNull(),
  customIconBorderRadius: varchar().notNull(),
});
