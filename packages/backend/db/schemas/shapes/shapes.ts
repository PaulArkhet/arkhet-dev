import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  pgEnum,
  text,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { projects } from '../projects';

export const shapeTypesArray = [
  'page',
  'button',
  'inputField',
  'text',
  'checkbox',
  'radio',
  'toggle',
  'card',
  'image',
  'dropdown',
  'circle',
  'chatbot',
  'divider',
  'navigation',
  'instance',
  'rectangle',
] as const;

export const shapeTypes = pgEnum('shape_type', shapeTypesArray);

/*
  Base table for all shapes – contains common fields plus a discriminator field “type”
*/
export const shapes = pgTable('shapes', {
  id: text().primaryKey().notNull(),
  xOffset: doublePrecision().notNull(),
  yOffset: doublePrecision().notNull(),
  width: integer().notNull(),
  height: integer().notNull(),
  minWidth: integer().notNull(),
  maxWidth: integer(),
  minHeight: integer().notNull(),
  maxHeight: integer(),
  isInstanceChild: boolean().notNull(),
  zIndex: integer().notNull(),
  projectId: integer()
    .references(() => projects.projectId, { onDelete: 'cascade' })
    .notNull(),
  // the shape “type” tells you which variant-specific table to join with
  type: shapeTypes().notNull(),
});

/*
  Variant tables for the different shape types.
  Each table uses the shape id as its primary key and a foreign key to the base “shapes” table.
*/
export const pageShapes = pgTable('page', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  subtype: varchar().notNull(),
  title: varchar().notNull(),
  description: varchar().notNull(),
});

export const buttonShapes = pgTable('button', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  title: varchar().notNull(),
  subtype: varchar().notNull(),
  size: varchar().notNull(),
});

/* 3. InputField shape: { title } */
export const inputFieldShapes = pgTable('input_field', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  title: varchar().notNull(),
});

/* 4. Text shape: { fontSize, fontColor, content, iconSrc } */
export const textShapes = pgTable('text', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  fontSize: varchar().notNull(),
  fontColor: varchar().notNull(),
  content: text().notNull(),
});

/* 5. Checkbox shape: { subtype, iconSrc, label, description, option1, option2 } */
export const checkboxShapes = pgTable('checkbox', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  subtype: varchar().notNull(),
  label: varchar().notNull(),
  option1: varchar().notNull(),
  option2: varchar().notNull(),
});

/* 6. Radio shape: { subtype, iconSrc, label, description, option1, option2, option3 } */
export const radioShapes = pgTable('radio', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  subtype: varchar().notNull(),
  label: varchar().notNull(),
  option1: varchar().notNull(),
  option2: varchar().notNull(),
  option3: varchar().notNull(),
});

/* 7. Toggle shape: { iconSrc } */
export const toggleShapes = pgTable('toggle', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 8. Card shape: { iconSrc, title, description, hasInstances }
     The childrenComponents array is modeled in a separate join table.
*/
export const cardShapes = pgTable('card', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  title: varchar().notNull(),
  description: varchar().notNull(),
  hasInstances: boolean().notNull(),
});

/* Junction table to store the card’s children components (an array of shape IDs) */
export const cardChildren = pgTable('card_children', {
  id: serial().primaryKey().notNull(),
  cardId: text()
    .notNull()
    .references(() => cardShapes.shapeId, { onDelete: 'cascade' }),
  childId: text()
    .notNull()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 9. Image shape: { iconSrc } */
export const imageShapes = pgTable('image', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 10. Dropdown shape: { iconSrc, option1, option2, option3 } */
export const dropdownShapes = pgTable('dropdown', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  iconSrc: varchar().notNull(),
  option1: varchar().notNull(),
  option2: varchar().notNull(),
  option3: varchar().notNull(),
});

/* 11. Circle shape: no additional fields (but separate table for consistency) */
export const circleShapes = pgTable('circle', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 12. Chatbot shape: no additional fields */
export const chatbotShapes = pgTable('chatbot', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 13. Divider shape: no additional fields */
export const dividerShapes = pgTable('divider', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 14. Navigation shape: { description, content, fontColor, fontSize } */
export const navigationShapes = pgTable('navigation', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  content: varchar().notNull(),
  fontColor: varchar().notNull(),
  fontSize: varchar().notNull(),
});

/* 15. Instance shape: { parentId } – links to a parent shape */
export const instanceShapes = pgTable('instance', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
  parentId: text()
    .notNull()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});

/* 16. Rectangle shape: no additional fields */
export const rectangleShapes = pgTable('rectangle', {
  shapeId: text()
    .primaryKey()
    .references(() => shapes.id, { onDelete: 'cascade' }),
});
