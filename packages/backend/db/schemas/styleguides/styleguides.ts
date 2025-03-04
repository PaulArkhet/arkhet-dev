import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";
import { users as usersTable } from "../users";
import { buttonStyles } from "./buttonStyles";
import { cardStyles } from "./cardStyles";
import { checkboxStyles } from "./checkboxStyles";
import { radioButtonStyles } from "./radioButtonStyles";
import { typographyStyles } from "./typographyStyles";
import { textFieldStyles } from "./textFieldStyles";
import { toggleStyles } from "./toggleStyles";
import { internalNavigationStyles } from "./internalNavigationStyles";
import { segmentedButtonStyles } from "./segmentedButtonStyles";

export const styleguides = pgTable("styleguides", {
  styleguideId: serial().primaryKey(),
  buttonPrimaryId: serial().references(() => buttonStyles.id, {
    onDelete: "cascade",
  }),
  buttonSecondaryId: serial().references(() => buttonStyles.id, {
    onDelete: "cascade",
  }),
  buttonTertiaryId: serial().references(() => buttonStyles.id, {
    onDelete: "cascade",
  }),
  buttonGhostId: serial().references(() => buttonStyles.id, {
    onDelete: "cascade",
  }),
  cardStylesId: serial().references(() => cardStyles.id, {
    onDelete: "cascade",
  }),
  checkboxStylesId: serial().references(() => checkboxStyles.id, {
    onDelete: "cascade",
  }),
  primaryColor: varchar().notNull(),
  secondaryColorStylesId: serial()
    .references(() => secondaryColorStyles.id, {
      onDelete: "cascade",
    })
    .notNull(),
  neutralColorStylesId: serial()
    .references(() => neutralColorStyles.id, {
      onDelete: "cascade",
    })
    .notNull(),
  radioButtonStylesId: serial().references(() => radioButtonStyles.id, {
    onDelete: "cascade",
  }),
  filename: varchar(),
  typographyStylesId: serial().references(() => typographyStyles.id, {
    onDelete: "cascade",
  }),
  textFieldStylesId: serial().references(() => textFieldStyles.id),
  toggleStylesId: serial().references(() => toggleStyles.id),
  internalNavigationStylesId: serial().references(
    () => internalNavigationStyles.id,
    { onDelete: "cascade" }
  ),
  segmentedButtonStylesId: serial().references(() => segmentedButtonStyles.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp().notNull().defaultNow(),
  editedAt: timestamp().notNull().defaultNow(),
  active: boolean().default(true).notNull(),
  userId: varchar()
    .references(() => usersTable.userId, { onDelete: "cascade" })
    .notNull(),
});

export const secondaryColorStyles = pgTable("secondary_color_styles", {
  id: serial().primaryKey(),
  firstColor: varchar().notNull(),
  secondColor: varchar().notNull(),
});

export const neutralColorStyles = pgTable("neutral_color_styles", {
  id: serial().primaryKey(),
  firstColor: varchar().notNull(),
  secondColor: varchar().notNull(),
  thirdColor: varchar().notNull(),
});
