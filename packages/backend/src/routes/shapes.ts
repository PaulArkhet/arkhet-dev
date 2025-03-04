import { Hono } from 'hono';
import { db } from '../../db/db';
import { getUser } from '../services/kinde.service';
import { assertIsParsableInt } from './projects';
import { HTTPException } from 'hono/http-exception';
import { mightFail } from 'might-fail';
import { eq } from 'drizzle-orm';

import {
  cardChildren,
  shapes as shapesTable,
} from '../../db/schemas/shapes/shapes';
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
import { zValidator } from '@hono/zod-validator';
import {
  wireframeSchemaItemInsert,
  wireframeSchemaItemPartial,
  type Wireframe,
} from '../interfaces/artboard';
import { createSelectSchema } from 'drizzle-zod';

const shapeSchemaMapping = {
  page: { schema: createSelectSchema(pageShapes), table: pageShapes },
  text: { schema: createSelectSchema(textShapes), table: textShapes },
  button: { schema: createSelectSchema(buttonShapes), table: buttonShapes },
  inputField: {
    schema: createSelectSchema(inputFieldShapes),
    table: inputFieldShapes,
  },
  checkbox: {
    schema: createSelectSchema(checkboxShapes),
    table: checkboxShapes,
  },
  radio: { schema: createSelectSchema(radioShapes), table: radioShapes },
  toggle: { schema: createSelectSchema(toggleShapes), table: toggleShapes },
  card: { schema: createSelectSchema(cardShapes), table: cardShapes },
  image: { schema: createSelectSchema(imageShapes), table: imageShapes },
  dropdown: {
    schema: createSelectSchema(dropdownShapes),
    table: dropdownShapes,
  },
  circle: { schema: createSelectSchema(circleShapes), table: circleShapes },
  chatbot: { schema: createSelectSchema(chatbotShapes), table: chatbotShapes },
  navigation: {
    schema: createSelectSchema(navigationShapes),
    table: navigationShapes,
  },
  divider: { schema: createSelectSchema(dividerShapes), table: dividerShapes },
  instance: {
    schema: createSelectSchema(instanceShapes),
    table: instanceShapes,
  },
  rectangle: {
    schema: createSelectSchema(rectangleShapes),
    table: rectangleShapes,
  },
} as const;

async function getChildrenIdsForCard(cardId: string) {
  return await db
    .select({ childId: cardChildren.childId })
    .from(cardChildren)
    .where(eq(cardChildren.cardId, cardId));
}

export const shapesRouter = new Hono()
  .use(getUser)
  .get('/:projectId', async (c) => {
    const { projectId: projectIdString } = c.req.param();
    const projectId = assertIsParsableInt(projectIdString);

    const { result: shapesQueryResult, error: queryError } = await mightFail(
      db
        .select({
          base: shapesTable,
          // Variant joins: only one of these will have data for a given shape based on its type.
          page: pageShapes,
          button: buttonShapes,
          inputField: inputFieldShapes,
          text: textShapes,
          checkbox: checkboxShapes,
          radio: radioShapes,
          toggle: toggleShapes,
          card: cardShapes,
          image: imageShapes,
          dropdown: dropdownShapes,
          circle: circleShapes,
          chatbot: chatbotShapes,
          divider: dividerShapes,
          navigation: navigationShapes,
          instance: instanceShapes,
          rectangle: rectangleShapes,
        })
        .from(shapesTable)
        .leftJoin(pageShapes, eq(shapesTable.id, pageShapes.shapeId))
        .leftJoin(buttonShapes, eq(shapesTable.id, buttonShapes.shapeId))
        .leftJoin(
          inputFieldShapes,
          eq(shapesTable.id, inputFieldShapes.shapeId)
        )
        .leftJoin(textShapes, eq(shapesTable.id, textShapes.shapeId))
        .leftJoin(checkboxShapes, eq(shapesTable.id, checkboxShapes.shapeId))
        .leftJoin(radioShapes, eq(shapesTable.id, radioShapes.shapeId))
        .leftJoin(toggleShapes, eq(shapesTable.id, toggleShapes.shapeId))
        .leftJoin(cardShapes, eq(shapesTable.id, cardShapes.shapeId))
        .leftJoin(imageShapes, eq(shapesTable.id, imageShapes.shapeId))
        .leftJoin(dropdownShapes, eq(shapesTable.id, dropdownShapes.shapeId))
        .leftJoin(circleShapes, eq(shapesTable.id, circleShapes.shapeId))
        .leftJoin(chatbotShapes, eq(shapesTable.id, chatbotShapes.shapeId))
        .leftJoin(dividerShapes, eq(shapesTable.id, dividerShapes.shapeId))
        .leftJoin(
          navigationShapes,
          eq(shapesTable.id, navigationShapes.shapeId)
        )
        .leftJoin(instanceShapes, eq(shapesTable.id, instanceShapes.shapeId))
        .leftJoin(rectangleShapes, eq(shapesTable.id, rectangleShapes.shapeId))
        .where(eq(shapesTable.projectId, projectId))
    );

    if (queryError) {
      throw new HTTPException(500, {
        message: 'Error when querying shapes.',
        cause: queryError,
      });
    }

    const parsedShapesQueryResult = shapesQueryResult
      .filter((rawShape) => {
        const type = rawShape.base.type;
        if (rawShape[type] === null) {
          console.error(
            'Shape type does not match with queried result, filtering invalid shape out.'
          );
          return false;
        }
        return true;
      })
      .map(async (rawShape) => {
        const type = rawShape.base.type;
        if (rawShape[type] === null) {
          console.error(rawShape);
          console.error(type);
          throw new Error('This should never occur.');
        }
        const parsedShape = {
          ...rawShape.base,
          ...rawShape[type],
        } as Wireframe;

        if (type === 'card') {
          const children = await mightFail(
            getChildrenIdsForCard(rawShape.base.id)
          );
          return { ...parsedShape, children };
        }

        return parsedShape;
      });

    const result = await Promise.all(parsedShapesQueryResult);

    return c.json({ parsedShapesQueryResult: result }, 200);
  })
  .post(
    '/create',
    zValidator('json', wireframeSchemaItemInsert, (result) => {
      if (!result.success) console.error(result.error);
    }),
    async (c) => {
      const shapeProps = c.req.valid('json');

      const result = await db.transaction(async (trx) => {
        const { error: baseShapeCreateError, result: baseShape } =
          await mightFail(
            trx.insert(shapesTable).values([shapeProps]).returning()
          );

        if (baseShapeCreateError) {
          console.error(baseShapeCreateError);
          console.log(shapeProps);
          trx.rollback();
          throw new HTTPException(500, {
            message: 'Error when creating base shape.',
            cause: baseShapeCreateError,
          });
        }

        const extraShapeTable = shapeSchemaMapping[shapeProps.type].table;

        const { error: extraShapeCreateError, result: extraShapeProps } =
          await mightFail(
            trx
              .insert(extraShapeTable)
              .values({ ...shapeProps, shapeId: baseShape[0].id })
              .returning()
          );

        if (extraShapeCreateError) {
          trx.rollback();
          throw new HTTPException(500, {
            message: 'Error when creating extra shape',
            cause: extraShapeCreateError,
          });
        }
        return { ...baseShape[0], ...extraShapeProps[0] } as Wireframe;
      });
      return c.json({ success: true, shape: result }, 200);
    }
  )
  .post(
    '/:shapeId/update',
    zValidator('json', wireframeSchemaItemPartial),
    async (c) => {
      const { shapeId } = c.req.param();
      const shapeProps = c.req.valid('json');

      const result = await db.transaction(async (trx) => {
        const { error: baseShapesUpdateError, result: baseShape } =
          await mightFail(
            trx
              .update(shapesTable)
              .set(shapeProps)
              .where(eq(shapesTable.id, shapeId))
              .returning()
          );

        if (baseShapesUpdateError) {
          trx.rollback();
          throw new HTTPException(500, {
            message: 'Error when updating base shape properties',
            cause: baseShapesUpdateError,
          });
        }

        if (baseShape.length === 0) {
          // need to retry as shape does not exist yet!
          return 404;
        }

        const extraShapeTable = shapeSchemaMapping[shapeProps.type].table;

        const { error: extraShapesUpdateError } = await mightFail(
          trx
            .update(extraShapeTable)
            .set({ ...shapeProps, shapeId: baseShape[0].id })
            .where(eq(extraShapeTable.shapeId, baseShape[0].id))
        );

        if (extraShapesUpdateError) {
          trx.rollback();
          throw new HTTPException(500, {
            message: 'Error when updating extra shape properties',
            cause: extraShapesUpdateError,
          });
        }

        if (shapeProps.type === 'card' && shapeProps.childrenComponents) {
          const childrenIds = new Set(
            (await getChildrenIdsForCard(shapeId)).map(({ childId }) => childId)
          );
          const incomingIds = new Set(shapeProps.childrenComponents);

          const idsToRemove = childrenIds.difference(incomingIds);
          const idsToAdd = incomingIds.difference(childrenIds);

          const removingPromiseArray = Array.from(idsToRemove).map(
            async (childId) =>
              await mightFail(
                trx
                  .delete(cardChildren)
                  .where(eq(cardChildren.childId, childId))
              )
          );

          const removingResults = await Promise.all(removingPromiseArray);
          const noErrorsRemoving = removingResults.every(
            ({ error }) => error === undefined
          );

          if (!noErrorsRemoving) {
            trx.rollback();
            throw new HTTPException(500, {
              message: 'Error when removing old child ids from card children.',
              cause: extraShapesUpdateError,
            });
          }

          const addingPromiseArray = Array.from(idsToAdd).map(
            async (childId) =>
              await mightFail(
                trx.insert(cardChildren).values({ childId, cardId: shapeId })
              )
          );
          const addingResults = await Promise.all(addingPromiseArray);
          const noErrorsAdding = addingResults.every(
            ({ error }) => error === undefined
          );

          if (!noErrorsAdding) {
            trx.rollback();
            throw new HTTPException(500, {
              message: 'Error when adding new child ids from card children.',
              cause: extraShapesUpdateError,
            });
          }
        }
      });

      if (result === 404) return c.json({ success: false }, 404);

      return c.json({ success: true }, 200);
    }
  )
  .post('/:shapeId/delete', async (c) => {
    const { shapeId } = c.req.param();

    const { error } = await mightFail(
      db.delete(shapesTable).where(eq(shapesTable.id, shapeId))
    );

    if (error) {
      throw new HTTPException(500, {
        message: 'Error when deleting shape.',
        cause: error,
      });
    }
    return c.json({ success: true }, 200);
  });
