import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const segmentedButtonStyles = pgTable("segmented_button_styles", {
  id: serial().primaryKey(),
  activeBgColor: varchar().notNull(),
  inactiveBgColor: varchar().notNull(),
  activeTextColor: varchar().notNull(),
  inactiveTextColor: varchar().notNull(),
  borderColor: varchar().notNull(),
  hoverBgColor: varchar().notNull(),
});

export const buttonLabel = pgTable("button_label", {
  id: serial().primaryKey(),
  label: varchar().notNull(),
  segmentedButtonStylesId: serial().references(() => segmentedButtonStyles.id, {
    onDelete: "cascade",
  }),
});
