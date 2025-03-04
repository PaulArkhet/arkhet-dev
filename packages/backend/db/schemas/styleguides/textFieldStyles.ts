import { boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const textFieldStyles = pgTable("text_field_styles", {
  id: serial().primaryKey(),
  inputStylePadding: varchar().notNull(),
  inputStyleBorderWidth: varchar().notNull(),
  inputStyleBorderColor: varchar().notNull(),
  inputStyleBorderStyle: varchar().notNull(),
  inputStyleBorderRadius: varchar().notNull(),
  inputStylePosition: varchar().notNull(),
  inputStyleBackgroundColor: varchar().notNull(),
  inputStyleClearable: boolean().notNull(),
  inputStyleBorderColorChecked: varchar().notNull(),
  labelStylePosition: varchar().notNull(),
  labelStyleBackgroundColor: varchar().notNull(),
  labelStyleZIndex: varchar().notNull(),
  labelStyleMarginTop: varchar().notNull(),
  labelStyleMarginLeft: varchar().notNull(),
  labelStylePadding: varchar().notNull(),
  supportingTextStyleFontSize: varchar().notNull(),
  supportingTextStyleColor: varchar().notNull(),
});
