import { Hono } from "hono";
import { getUser } from "../services/kinde.service";
import { mightFail } from "might-fail";
import { db } from "../../db/db";
import { styleguides as styleguidesTable } from "../../db/schemas/styleguides/styleguides";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt } from "./projects";
import { zValidator } from "@hono/zod-validator";
import {
  createStyleGuide,
  styleguideCreateArgsParser,
  styleguideSelectStatement,
  styleguideUpdateArgsParser,
  updateStyleGuide,
  type StyleguideWithJoins,
} from "../services/styleguide.service";

export const styleguideRouter = new Hono()
  .use(getUser)
  .get("/", async (c) => {
    const { userId } = c.var.dbUser;

    const { error: styleguideQueryError, result: styleguideQueryResult } =
      await mightFail(
        styleguideSelectStatement.where(eq(styleguidesTable.userId, userId))
      );

    if (styleguideQueryError) {
      throw new HTTPException(500, {
        message: "Error when fetching styleguides",
        cause: styleguideQueryError,
      });
    }

    const resultWithButtonLabelsJoined = styleguideQueryResult.reduce(
      (acc, row) => {
        const foundStyleguideIndex = acc.findIndex(
          (item) => item.styleguideId === row.styleguideId
        );
        if (foundStyleguideIndex === -1) {
          const newStyleguide: StyleguideWithJoins = {
            ...row,
            segmentedButtonStyles: {
              ...row.segmentedButtonStyles,
              buttonLabel: [row.buttonLabel],
            },
          };
          acc.push(newStyleguide);
          return acc;
        }
        acc[foundStyleguideIndex].segmentedButtonStyles.buttonLabel.push(
          row.buttonLabel
        );
        return acc;
      },
      [] as StyleguideWithJoins[]
    );

    return c.json({ styleguideQueryResult: resultWithButtonLabelsJoined }, 200);
  })
  .get("/:styleguideId", async (c) => {
    const { styleguideId: styleguideIdString } = c.req.param();
    const styleguideId = assertIsParsableInt(styleguideIdString);

    const { result: styleguideQueryResult, error: styleguideQueryError } =
      await mightFail(
        styleguideSelectStatement.where(
          eq(styleguidesTable.styleguideId, styleguideId)
        )
      );

    if (styleguideQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching styleguide.",
        cause: styleguideQueryError,
      });
    }

    return c.json({ styleguide: styleguideQueryResult[0] });
  })
  .post(
    "/create",
    zValidator("json", styleguideCreateArgsParser),
    async (c) => {
      const { userId } = c.var.dbUser;

      const insertValues = c.req.valid("json");
      const { error: styleguideInsertError, result: styleguideInsertResult } =
        await mightFail(createStyleGuide(insertValues, userId));

      if (styleguideInsertError) {
        throw new HTTPException(500, {
          message: "Error while creating styleguide",
          cause: styleguideInsertError,
        });
      }

      return c.json({ styleguide: styleguideInsertResult }, 200);
    }
  )
  .post(
    "/:styleguideId/update",
    zValidator("json", styleguideUpdateArgsParser),
    async (c) => {
      const newValues = c.req.valid("json");
      const styleguideId = assertIsParsableInt(c.req.param().styleguideId);
      const { error: updateStyleguideError, result: updatedStyleguide } =
        await mightFail(updateStyleGuide(styleguideId, newValues));

      if (updateStyleguideError) {
        throw new HTTPException(500, {
          message: "Error updating styleguide",
          cause: updateStyleguideError,
        });
      }

      return c.json({ updatedStyleguide: updatedStyleguide }, 200);
    }
  )
  .post("/:styleguideId/delete", async (c) => {
    const styleguideId = assertIsParsableInt(c.req.param().styleguideId);
    const { error: deleteStyleguideError } = await mightFail(
      db
        .delete(styleguidesTable)
        .where(eq(styleguidesTable.styleguideId, styleguideId))
    );

    if (deleteStyleguideError) {
      throw new HTTPException(500, {
        message: "Error deleting styleguide.",
        cause: deleteStyleguideError,
      });
    }

    return c.json({}, 200);
  });
