import { db } from "../../db/db";
import { mightFail } from "might-fail";
import {
  neutralColorStyles,
  secondaryColorStyles,
  styleguides as styleguidesTable,
} from "../../db/schemas/styleguides/styleguides";
import {
  aliasedTable,
  eq,
  getTableColumns,
  type InferInsertModel,
} from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createInsertSchema } from "drizzle-zod";
import { buttonStyles } from "../../db/schemas/styleguides/buttonStyles";
import { cardStyles } from "../../db/schemas/styleguides/cardStyles";
import { checkboxStyles } from "../../db/schemas/styleguides/checkboxStyles";
import { internalNavigationStyles } from "../../db/schemas/styleguides/internalNavigationStyles";
import { radioButtonStyles } from "../../db/schemas/styleguides/radioButtonStyles";
import {
  buttonLabel,
  segmentedButtonStyles,
} from "../../db/schemas/styleguides/segmentedButtonStyles";
import { textFieldStyles } from "../../db/schemas/styleguides/textFieldStyles";
import { toggleStyles } from "../../db/schemas/styleguides/toggleStyles";
import { typographyStyles } from "../../db/schemas/styleguides/typographyStyles";
import { z } from "zod";

const {
  buttonPrimaryId: _buttonPrimaryId,
  buttonSecondaryId: _buttonSecondaryId,
  buttonTertiaryId: _buttonTertiaryId,
  buttonGhostId: _buttonGhostId,
  cardStylesId: _cardStylesId,
  checkboxStylesId: _checkboxStylesId,
  internalNavigationStylesId: _internalNavigationStylesId,
  radioButtonStylesId: _radioButtonStylesId,
  segmentedButtonStylesId: _segmentedButtonStylesId,
  textFieldStylesId: _textFieldStylesId,
  toggleStylesId: _toggleStylesId,
  typographyStylesId: _typographyStylesId,
  secondaryColorStylesId: _secondaryColorStylesId,
  neutralColorStylesId: _neutralColorStylesId,
  ...restStyleguideColumns
} = getTableColumns(styleguidesTable);

const buttonPrimary = aliasedTable(buttonStyles, "buttonPrimary");
const buttonSecondary = aliasedTable(buttonStyles, "buttonSecondary");
const buttonTertiary = aliasedTable(buttonStyles, "buttonTertiary");
const buttonGhost = aliasedTable(buttonStyles, "buttonGhost");

export const styleguideSelectStatement = db
  .select({
    ...restStyleguideColumns,
    buttonPrimary,
    buttonSecondary,
    buttonTertiary,
    buttonGhost,
    cardStyles,
    checkboxStyles,
    internalNavigationStyles,
    radioButtonStyles,
    segmentedButtonStyles,
    buttonLabel,
    textFieldStyles,
    toggleStyles,
    typographyStyles,
    secondaryColorStyles,
    neutralColorStyles,
  })
  .from(styleguidesTable)
  .innerJoin(
    buttonPrimary,
    eq(buttonPrimary.id, styleguidesTable.buttonPrimaryId)
  )
  .innerJoin(
    buttonSecondary,
    eq(buttonSecondary.id, styleguidesTable.buttonSecondaryId)
  )
  .innerJoin(
    buttonTertiary,
    eq(buttonTertiary.id, styleguidesTable.buttonTertiaryId)
  )
  .innerJoin(buttonGhost, eq(buttonGhost.id, styleguidesTable.buttonGhostId))
  .innerJoin(cardStyles, eq(cardStyles.id, styleguidesTable.cardStylesId))
  .innerJoin(
    checkboxStyles,
    eq(checkboxStyles.id, styleguidesTable.checkboxStylesId)
  )
  .innerJoin(
    internalNavigationStyles,
    eq(internalNavigationStyles.id, styleguidesTable.internalNavigationStylesId)
  )
  .innerJoin(
    radioButtonStyles,
    eq(radioButtonStyles.id, styleguidesTable.radioButtonStylesId)
  )
  .innerJoin(
    segmentedButtonStyles,
    eq(segmentedButtonStyles.id, styleguidesTable.segmentedButtonStylesId)
  )
  .innerJoin(
    buttonLabel,
    eq(buttonLabel.segmentedButtonStylesId, segmentedButtonStyles.id)
  )
  .innerJoin(
    textFieldStyles,
    eq(textFieldStyles.id, styleguidesTable.textFieldStylesId)
  )
  .innerJoin(toggleStyles, eq(toggleStyles.id, styleguidesTable.toggleStylesId))
  .innerJoin(
    typographyStyles,
    eq(typographyStyles.id, styleguidesTable.typographyStylesId)
  )
  .innerJoin(
    secondaryColorStyles,
    eq(secondaryColorStyles.id, styleguidesTable.secondaryColorStylesId)
  )
  .innerJoin(
    neutralColorStyles,
    eq(neutralColorStyles.id, styleguidesTable.neutralColorStylesId)
  );

const buttonStylesSchema = createInsertSchema(buttonStyles).omit({ id: true });

export const styleguideCreateArgsParser = createInsertSchema(styleguidesTable)
  .extend({
    buttonPrimary: buttonStylesSchema,
    buttonSecondary: buttonStylesSchema,
    buttonTertiary: buttonStylesSchema,
    buttonGhost: buttonStylesSchema,
    cardStyles: createInsertSchema(cardStyles).omit({ id: true }),
    checkboxStyles: createInsertSchema(checkboxStyles).omit({ id: true }),
    internalNavigationStyles: createInsertSchema(internalNavigationStyles).omit(
      { id: true }
    ),
    radioButtonStyles: createInsertSchema(radioButtonStyles).omit({ id: true }),
    segmentedButtonStyles: createInsertSchema(segmentedButtonStyles)
      .extend({
        buttonLabel: z.array(
          createInsertSchema(buttonLabel).omit({ id: true })
        ),
      })
      .omit({ id: true }),
    textFieldStyles: createInsertSchema(textFieldStyles).omit({ id: true }),
    toggleStyles: createInsertSchema(toggleStyles).omit({ id: true }),
    typographyStyles: createInsertSchema(typographyStyles).omit({ id: true }),
    secondaryColorStyles: createInsertSchema(secondaryColorStyles).omit({
      id: true,
    }),
    neutralColorStyles: createInsertSchema(neutralColorStyles).omit({
      id: true,
    }),
  })
  .omit({
    // protect styleguide id
    styleguideId: true,

    // joined tables
    buttonPrimaryId: true,
    buttonSecondaryId: true,
    buttonTertiaryId: true,
    buttonGhostId: true,
    cardStylesId: true,
    checkboxStylesId: true,
    internalNavigationStylesId: true,
    radioButtonStylesId: true,
    segmentedButtonStylesId: true,
    textFieldStylesId: true,
    toggleStylesId: true,
    typographyStylesId: true,
    secondaryColorStylesId: true,
    neutralColorStylesId: true,

    // automatically updated fields
    editedAt: true,
    createdAt: true,
  });

/**
 * Practically the same as styleguide create args parser, just used to have a zod schema for the incoming
 * types of a styleguide select statement
 *
 */
export const styleguideSelectParser = createInsertSchema(styleguidesTable)
  .extend({
    createdAt: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    ),
    editedAt: z.preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date()
    ),
    styleguideId: z.number(), // non-optional
    buttonPrimary: buttonStylesSchema,
    buttonSecondary: buttonStylesSchema,
    buttonTertiary: buttonStylesSchema,
    buttonGhost: buttonStylesSchema,
    cardStyles: createInsertSchema(cardStyles).omit({ id: true }),
    checkboxStyles: createInsertSchema(checkboxStyles).omit({ id: true }),
    internalNavigationStyles: createInsertSchema(internalNavigationStyles).omit(
      { id: true }
    ),
    radioButtonStyles: createInsertSchema(radioButtonStyles).omit({ id: true }),
    segmentedButtonStyles: createInsertSchema(segmentedButtonStyles)
      .extend({
        buttonLabel: z.array(
          createInsertSchema(buttonLabel).omit({ id: true })
        ),
      })
      .omit({ id: true }),
    textFieldStyles: createInsertSchema(textFieldStyles).omit({ id: true }),
    toggleStyles: createInsertSchema(toggleStyles).omit({ id: true }),
    typographyStyles: createInsertSchema(typographyStyles).omit({ id: true }),
    secondaryColorStyles: createInsertSchema(secondaryColorStyles).omit({
      id: true,
    }),
    neutralColorStyles: createInsertSchema(neutralColorStyles).omit({
      id: true,
    }),
  })
  .omit({
    // joined tables
    buttonPrimaryId: true,
    buttonSecondaryId: true,
    buttonTertiaryId: true,
    buttonGhostId: true,
    cardStylesId: true,
    checkboxStylesId: true,
    internalNavigationStylesId: true,
    radioButtonStylesId: true,
    segmentedButtonStylesId: true,
    textFieldStylesId: true,
    toggleStylesId: true,
    typographyStylesId: true,
    secondaryColorStylesId: true,
    neutralColorStylesId: true,
  });

export async function createStyleGuide(
  args: Omit<z.infer<typeof styleguideCreateArgsParser>, "userId">,
  userId: string
) {
  const {
    buttonPrimary: buttonPrimaryValues,
    buttonSecondary: buttonSecondaryValues,
    buttonTertiary: buttonTertiaryValues,
    buttonGhost: buttonGhostValues,
    cardStyles: cardStylesValues,
    checkboxStyles: checkboxStylesValues,
    internalNavigationStyles: internalNavigationStylesValues,
    radioButtonStyles: radioButtonStylesValues,
    segmentedButtonStyles: segmentedButtonStylesValues,
    textFieldStyles: textFieldStylesValues,
    toggleStyles: toggleStylesValues,
    typographyStyles: typographyStylesValues,
    secondaryColorStyles: secondaryColorStylesValues,
    neutralColorStyles: neutralColorStylesValues,
    ...rest
  } = args;

  const { result: newStyleGuide, error } = await mightFail(
    db.transaction(async (trx) => {
      const buttonPrimaryEntry = await trx
        .insert(buttonStyles)
        .values({
          ...buttonPrimaryValues,
          id: undefined,
        })
        .returning();
      const buttonSecondaryEntry = await trx
        .insert(buttonStyles)
        .values({
          ...buttonSecondaryValues,
          id: undefined,
        })
        .returning();
      const buttonTertiaryEntry = await trx
        .insert(buttonStyles)
        .values({
          ...buttonTertiaryValues,
          id: undefined,
        })
        .returning();
      const buttonGhostEntry = await trx
        .insert(buttonStyles)
        .values({
          ...buttonGhostValues,
          id: undefined,
        })
        .returning();
      const cardStylesEntry = await trx
        .insert(cardStyles)
        .values({
          ...cardStylesValues,
          id: undefined,
        })
        .returning();
      const checkboxStylesEntry = await trx
        .insert(checkboxStyles)
        .values({
          ...checkboxStylesValues,
          id: undefined,
        })
        .returning();
      const internalNavigationStylesEntry = await trx
        .insert(internalNavigationStyles)
        .values({
          ...internalNavigationStylesValues,
          id: undefined,
        })
        .returning();
      const radioButtonStylesEntry = await trx
        .insert(radioButtonStyles)
        .values({
          ...radioButtonStylesValues,
          id: undefined,
        })
        .returning();

      const segmentedButtonStylesEntry = await trx
        .insert(segmentedButtonStyles)
        .values({
          ...segmentedButtonStylesValues,
          id: undefined,
        })
        .returning();

      const buttonLabelsWithIds = args.segmentedButtonStyles.buttonLabel.map(
        (buttonLabel) => ({
          label: buttonLabel.label,
          segmentedButtonStylesId: segmentedButtonStylesEntry[0].id,
        })
      );

      await trx.insert(buttonLabel).values(buttonLabelsWithIds);

      const textFieldStylesEntry = await trx
        .insert(textFieldStyles)
        .values({
          ...textFieldStylesValues,
          id: undefined,
        })
        .returning();
      const toggleStylesEntry = await trx
        .insert(toggleStyles)
        .values({
          ...toggleStylesValues,
          id: undefined,
        })
        .returning();
      const typographyStylesEntry = await trx
        .insert(typographyStyles)
        .values({
          ...typographyStylesValues,
          id: undefined,
        })
        .returning();
      const secondaryColorStylesEntry = await trx
        .insert(secondaryColorStyles)
        .values({
          ...secondaryColorStylesValues,
          id: undefined,
        })
        .returning();
      const neutralColorStylesEntry = await trx
        .insert(neutralColorStyles)
        .values({
          ...neutralColorStylesValues,
          id: undefined,
        })
        .returning();

      const insertValues: InferInsertModel<typeof styleguidesTable> = {
        ...rest,
        buttonPrimaryId: buttonPrimaryEntry[0].id,
        buttonSecondaryId: buttonSecondaryEntry[0].id,
        buttonTertiaryId: buttonTertiaryEntry[0].id,
        buttonGhostId: buttonGhostEntry[0].id,
        cardStylesId: cardStylesEntry[0].id,
        checkboxStylesId: checkboxStylesEntry[0].id,
        internalNavigationStylesId: internalNavigationStylesEntry[0].id,
        radioButtonStylesId: radioButtonStylesEntry[0].id,
        segmentedButtonStylesId: segmentedButtonStylesEntry[0].id,
        textFieldStylesId: textFieldStylesEntry[0].id,
        toggleStylesId: toggleStylesEntry[0].id,
        typographyStylesId: typographyStylesEntry[0].id,
        secondaryColorStylesId: secondaryColorStylesEntry[0].id,
        neutralColorStylesId: neutralColorStylesEntry[0].id,
        userId,
      };
      const [newStyleGuide] = await trx
        .insert(styleguidesTable)
        .values(insertValues)
        .returning();
      return newStyleGuide;
    })
  );

  if (error) {
    console.error("Error caught in create styleguide transaction:", error);
    throw error;
  }

  return newStyleGuide;
}

const styleguideCreateArgsShape = styleguideCreateArgsParser.shape;

export const styleguideUpdateArgsParser = styleguideCreateArgsParser
  .extend({
    buttonPrimary: styleguideCreateArgsShape.buttonPrimary.partial(),
    buttonSecondary: styleguideCreateArgsShape.buttonSecondary.partial(),
    buttonTertiary: styleguideCreateArgsShape.buttonTertiary.partial(),
    buttonGhost: styleguideCreateArgsShape.buttonGhost.partial(),
    cardStyles: styleguideCreateArgsShape.cardStyles.partial(),
    checkboxStyles: styleguideCreateArgsShape.checkboxStyles.partial(),
    internalNavigationStyles:
      styleguideCreateArgsShape.internalNavigationStyles.partial(),
    radioButtonStyles: styleguideCreateArgsShape.radioButtonStyles.partial(),
    segmentedButtonStyles: styleguideCreateArgsShape.segmentedButtonStyles
      .extend({
        buttonLabel:
          styleguideCreateArgsShape.segmentedButtonStyles.shape.buttonLabel.optional(),
      })
      .partial(),
    textFieldStyles: styleguideCreateArgsShape.textFieldStyles.partial(),
    toggleStyles: styleguideCreateArgsShape.toggleStyles.partial(),
    typographyStyles: styleguideCreateArgsShape.typographyStyles.partial(),
    secondaryColorStyles:
      styleguideCreateArgsShape.secondaryColorStyles.partial(),
    neutralColorStyles: styleguideCreateArgsShape.neutralColorStyles.partial(),
  })
  .partial();

/**
 * Partially update a styleguide, including its joined child tables.
 * If a nested style object is provided, update that table; otherwise, skip it.
 */
export async function updateStyleGuide(
  styleguideId: number,
  partialArgs: z.infer<typeof styleguideUpdateArgsParser>
) {
  const { result: updatedStyleguide, error } = await mightFail(
    db.transaction(async (trx) => {
      // 1. Fetch the existing styleguide record within the transaction
      const existingStyleguides = await trx
        .select()
        .from(styleguidesTable)
        .where(eq(styleguidesTable.styleguideId, styleguideId));

      if (!existingStyleguides.length) {
        throw new HTTPException(404, {
          message: `Styleguide with ID ${styleguideId} not found.`,
        });
      }

      const existing = existingStyleguides[0];

      // 2. Destructure the (potentially) updated fields from partialArgs
      const {
        buttonPrimary,
        buttonSecondary,
        buttonTertiary,
        buttonGhost,
        cardStyles: cardStylesValues,
        checkboxStyles: checkboxStylesValues,
        internalNavigationStyles: internalNavigationStylesValues,
        radioButtonStyles: radioButtonStylesValues,
        segmentedButtonStyles: segmentedButtonStylesValues,
        textFieldStyles: textFieldStylesValues,
        toggleStyles: toggleStylesValues,
        typographyStyles: typographyStylesValues,
        secondaryColorStyles: secondaryColorStylesValues,
        neutralColorStyles: neutralColorStylesValues,
        ...rest
      } = partialArgs;

      // 3. Update each of the child tables if new values are provided
      //    Make sure to omit `id` from updates to avoid PK issues.
      if (buttonPrimary) {
        await trx
          .update(buttonStyles)
          .set({ ...buttonPrimary, id: undefined })
          .where(eq(buttonStyles.id, existing.buttonPrimaryId));
      }
      if (buttonSecondary) {
        await trx
          .update(buttonStyles)
          .set({ ...buttonSecondary, id: undefined })
          .where(eq(buttonStyles.id, existing.buttonSecondaryId));
      }
      if (buttonTertiary) {
        await trx
          .update(buttonStyles)
          .set({ ...buttonTertiary, id: undefined })
          .where(eq(buttonStyles.id, existing.buttonTertiaryId));
      }
      if (buttonGhost) {
        await trx
          .update(buttonStyles)
          .set({ ...buttonGhost, id: undefined })
          .where(eq(buttonStyles.id, existing.buttonGhostId));
      }

      if (cardStylesValues) {
        await trx
          .update(cardStyles)
          .set({ ...cardStylesValues, id: undefined })
          .where(eq(cardStyles.id, existing.cardStylesId));
      }
      if (checkboxStylesValues) {
        await trx
          .update(checkboxStyles)
          .set({ ...checkboxStylesValues, id: undefined })
          .where(eq(checkboxStyles.id, existing.checkboxStylesId));
      }
      if (internalNavigationStylesValues) {
        await trx
          .update(internalNavigationStyles)
          .set({ ...internalNavigationStylesValues, id: undefined })
          .where(
            eq(internalNavigationStyles.id, existing.internalNavigationStylesId)
          );
      }
      if (radioButtonStylesValues) {
        await trx
          .update(radioButtonStyles)
          .set({ ...radioButtonStylesValues, id: undefined })
          .where(eq(radioButtonStyles.id, existing.radioButtonStylesId));
      }
      if (segmentedButtonStylesValues) {
        await trx
          .update(segmentedButtonStyles)
          .set({ ...segmentedButtonStylesValues, id: undefined })
          .where(
            eq(segmentedButtonStyles.id, existing.segmentedButtonStylesId)
          );
      }
      if (textFieldStylesValues) {
        await trx
          .update(textFieldStyles)
          .set({ ...textFieldStylesValues, id: undefined })
          .where(eq(textFieldStyles.id, existing.textFieldStylesId));
      }
      if (toggleStylesValues) {
        await trx
          .update(toggleStyles)
          .set({ ...toggleStylesValues, id: undefined })
          .where(eq(toggleStyles.id, existing.toggleStylesId));
      }
      if (typographyStylesValues) {
        await trx
          .update(typographyStyles)
          .set({ ...typographyStylesValues, id: undefined })
          .where(eq(typographyStyles.id, existing.typographyStylesId));
      }
      if (secondaryColorStylesValues) {
        await trx
          .update(secondaryColorStyles)
          .set({ ...secondaryColorStylesValues, id: undefined })
          .where(eq(secondaryColorStyles.id, existing.secondaryColorStylesId));
      }
      if (neutralColorStylesValues) {
        await trx
          .update(neutralColorStyles)
          .set({ ...neutralColorStylesValues, id: undefined })
          .where(eq(neutralColorStyles.id, existing.neutralColorStylesId));
      }

      // 4. Update the styleguide table itself with any top-level changes
      //    (e.g., name, description, etc.). If no changes remain in `rest`,
      //    we just re-fetch the record.
      let updatedStyleguideRecord;

      if (Object.keys(rest).length > 0) {
        const [styleguide] = await trx
          .update(styleguidesTable)
          .set({
            ...rest,
            editedAt: new Date(),
          })
          .where(eq(styleguidesTable.styleguideId, styleguideId))
          .returning();
        updatedStyleguideRecord = styleguide;
      } else {
        const [styleguide] = await trx
          .select()
          .from(styleguidesTable)
          .where(eq(styleguidesTable.styleguideId, styleguideId));
        updatedStyleguideRecord = styleguide;
      }

      // 5. Return whatever final shape you'd like. If you want to refetch joined data,
      //    you can do so here before returning.
      return updatedStyleguideRecord;
    })
  );

  // If there was any error, mightFail returns it here; you can throw or handle as needed:
  if (error) {
    console.error("Error caught in update styleguide transaction:", error);
    throw error; // or wrap it in an HTTPException, etc.
  }

  // Successfully updated styleguide:
  return updatedStyleguide;
}

export type StyleguideWithJoins = z.infer<typeof styleguideSelectParser>;
