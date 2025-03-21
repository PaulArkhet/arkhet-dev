import type { InferSelectModel } from 'drizzle-orm';
import { shapes as shapesTable } from '../../db/schemas/shapes/shapes';
import { pageShapes } from '../../db/schemas/shapes/shapes';
import { buttonShapes } from '../../db/schemas/shapes/shapes';
import { inputFieldShapes } from '../../db/schemas/shapes/shapes';
import { textShapes } from '../../db/schemas/shapes/shapes';
import { checkboxShapes } from '../../db/schemas/shapes/shapes';
import { radioShapes } from '../../db/schemas/shapes/shapes';
import { toggleShapes } from '../../db/schemas/shapes/shapes';
import { cardShapes } from '../../db/schemas/shapes/shapes';
import { imageShapes } from '../../db/schemas/shapes/shapes';
import { dropdownShapes } from '../../db/schemas/shapes/shapes';
import { circleShapes } from '../../db/schemas/shapes/shapes';
import { chatbotShapes } from '../../db/schemas/shapes/shapes';
import { dividerShapes } from '../../db/schemas/shapes/shapes';
import { navigationShapes } from '../../db/schemas/shapes/shapes';
import { instanceShapes } from '../../db/schemas/shapes/shapes';
import { rectangleShapes } from '../../db/schemas/shapes/shapes';
import { checkboxOptions } from '../../db/schemas/shapes/shapes';
import { z } from 'zod';
import type {
  handleTypeArray,
  multipagePath,
} from '../../db/schemas/multipagePath';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

const shapeVariationsSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('page') }).merge(createSelectSchema(pageShapes)),
  z.object({ type: z.literal('text') }).merge(createSelectSchema(textShapes)),
  z
    .object({ type: z.literal('button') })
    .merge(createSelectSchema(buttonShapes)),
  z
    .object({ type: z.literal('inputField') })
    .merge(createSelectSchema(inputFieldShapes)),
  z
    .object({ type: z.literal('checkbox') })
    .merge(createSelectSchema(checkboxShapes).merge(
      z.object({
          options: z.array(createSelectSchema(checkboxOptions)),
        })
      )
    )
    .omit({ shapeId: true }),
  z.object({ type: z.literal('radio') }).merge(createSelectSchema(radioShapes)),
  z
    .object({ type: z.literal('toggle') })
    .merge(createSelectSchema(toggleShapes)),
  z.object({ type: z.literal('card') }).merge(
    createSelectSchema(cardShapes).merge(
      z.object({
        childrenComponents: z.array(z.string()),
      })
    )
  ),
  z.object({ type: z.literal('image') }).merge(createSelectSchema(imageShapes)),
  z
    .object({ type: z.literal('dropdown') })
    .merge(createSelectSchema(dropdownShapes)),
  z
    .object({ type: z.literal('circle') })
    .merge(createSelectSchema(circleShapes)),
  z
    .object({ type: z.literal('chatbot') })
    .merge(createSelectSchema(chatbotShapes)),
  z
    .object({ type: z.literal('divider') })
    .merge(createSelectSchema(dividerShapes)),
  z
    .object({ type: z.literal('navigation') })
    .merge(createSelectSchema(navigationShapes)),
  z
    .object({ type: z.literal('instance') })
    .merge(createSelectSchema(instanceShapes)),
  z
    .object({ type: z.literal('rectangle') })
    .merge(createSelectSchema(rectangleShapes)),
]);

const shapeVariationsSchemaPartial = z.discriminatedUnion('type', [
  z
    .object({ type: z.literal('page') })
    .merge(createUpdateSchema(pageShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('text') })
    .merge(createUpdateSchema(textShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('button') })
    .merge(createUpdateSchema(buttonShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('inputField') })
    .merge(createUpdateSchema(inputFieldShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('checkbox') })
    .merge(
      createUpdateSchema(checkboxShapes).merge(
        z.object({
          options: z.array(createUpdateSchema(checkboxOptions)).optional(),
        }),
      )
    )
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('radio') })
    .merge(createUpdateSchema(radioShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('toggle') })
    .merge(createUpdateSchema(toggleShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('card') })
    .merge(
      createUpdateSchema(cardShapes).merge(
        z.object({
          childrenComponents: z.optional(z.array(z.string())),
        })
      )
    )
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('image') })
    .merge(createUpdateSchema(imageShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('dropdown') })
    .merge(createUpdateSchema(dropdownShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('circle') })
    .merge(createUpdateSchema(circleShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('chatbot') })
    .merge(createUpdateSchema(chatbotShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('divider') })
    .merge(createUpdateSchema(dividerShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('navigation') })
    .merge(createUpdateSchema(navigationShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('instance') })
    .merge(createUpdateSchema(instanceShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('rectangle') })
    .merge(createUpdateSchema(rectangleShapes))
    .omit({ shapeId: true }),
]);

const shapeVariationsSchemaInsert = z.discriminatedUnion('type', [
  z
    .object({ type: z.literal('page') })
    .merge(createInsertSchema(pageShapes).omit({ shapeId: true })),
  z
    .object({ type: z.literal('text') })
    .merge(createInsertSchema(textShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('button') })
    .merge(createInsertSchema(buttonShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('inputField') })
    .merge(createInsertSchema(inputFieldShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('checkbox') })
    .merge(
      createInsertSchema(checkboxShapes).merge(
        z.object({
          options: z.array(createInsertSchema(checkboxOptions)),
        }),
      )
    )
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('radio') })
    .merge(createInsertSchema(radioShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('toggle') })
    .merge(createInsertSchema(toggleShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('card') })
    .merge(createInsertSchema(cardShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('image') })
    .merge(createInsertSchema(imageShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('dropdown') })
    .merge(createInsertSchema(dropdownShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('circle') })
    .merge(createInsertSchema(circleShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('chatbot') })
    .merge(createInsertSchema(chatbotShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('divider') })
    .merge(createInsertSchema(dividerShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('navigation') })
    .merge(createInsertSchema(navigationShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('instance') })
    .merge(createInsertSchema(instanceShapes))
    .omit({ shapeId: true }),
  z
    .object({ type: z.literal('rectangle') })
    .merge(createInsertSchema(rectangleShapes))
    .omit({ shapeId: true }),
]);

export const baseShapeSchema = createSelectSchema(shapesTable).omit({
  type: true,
});
export const baseShapeSchemaPartial = createUpdateSchema(shapesTable).omit({
  id: true,
  projectId: true,
  type: true,
});
export const baseShapeSchemaInsert = createInsertSchema(shapesTable);

export const wireframeSchemaItem = shapeVariationsSchema.and(baseShapeSchema);
export const wireframeSchemaItemPartial = shapeVariationsSchemaPartial.and(
  baseShapeSchemaPartial
);
export const wireframeSchemaItemInsert = shapeVariationsSchemaInsert.and(
  baseShapeSchemaInsert
);

export const wireframeSchema = z.array(
  shapeVariationsSchema.and(baseShapeSchema)
);

export type BaseShape = z.infer<typeof baseShapeSchema>;
export type ShapeVariations = z.infer<typeof shapeVariationsSchema>;
export type ComponentTypes = ShapeVariations['type'];
export type Wireframe = z.infer<typeof wireframeSchema>[number];

// we're only exporting the types below from here because of a refactor

export type PermanentPath = InferSelectModel<typeof multipagePath>;
export type HandleType = (typeof handleTypeArray)[number];
