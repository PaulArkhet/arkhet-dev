import { serial, pgTable, varchar, boolean } from "drizzle-orm/pg-core";

export const cardStyles = pgTable("card_styles", {
  id: serial().primaryKey(),
  backgroundColor: varchar().notNull(),
  borderRadius: varchar().notNull(),
  border: varchar().notNull(),
  hoveredBackgroundColor: varchar().notNull(),
  color: varchar().notNull(),
  textColor: varchar().notNull(),
  mainCardPicture: boolean().notNull(),
  mainCardButton: boolean().notNull(),
  subCardPicture: boolean().notNull(),
  listCardBorderRadius: varchar().notNull(),
  listBackgroundColor: varchar().notNull(),
  listTextColor: varchar().notNull(),
  listColor: varchar().notNull(),
  listBorderRadius: varchar().notNull(),
  listShowAvatar: boolean().notNull(),
  listShowCheckbox: boolean().notNull(),
  listWidth: varchar().notNull(),
});
