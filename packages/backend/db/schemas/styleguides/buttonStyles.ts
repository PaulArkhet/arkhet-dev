import { pgTable, serial, varchar, boolean } from "drizzle-orm/pg-core";

export const buttonStyles = pgTable("button_styles", {
  id: serial().primaryKey(),
  color: varchar(),
  textColor: varchar().notNull(),
  fontSize: varchar().notNull(),
  borderRadius: varchar().notNull(),
  paddingRight: varchar().notNull(),
  paddingLeft: varchar().notNull(),
  paddingTop: varchar().notNull(),
  paddingBottom: varchar().notNull(),
  borderColor: varchar().notNull(),
  borderWidth: varchar().notNull(),
  backgroundColor: varchar().notNull(),
  hoveredBackgroundColor: varchar().notNull(),
  hoveredTextColor: varchar().notNull(),
  isHovered: boolean().notNull(),
});
