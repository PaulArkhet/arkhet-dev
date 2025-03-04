import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const internalNavigationStyles = pgTable("internal_navigation_style", {
  id: serial().primaryKey(),
  internalBorderBottom: varchar().notNull(),
  internalBorderRadius: varchar().notNull(),
  internalPaddingBottom: varchar().notNull(),
  activeColor: varchar().notNull(),
  activeTextDecoration: varchar().notNull(),
  activeTextDecorationThickness: varchar().notNull(),
  activeMarginBottom: varchar().notNull(),
  activeTextDecorationOffset: varchar().notNull(),
  activeBorderBottom: varchar().notNull(),
});
