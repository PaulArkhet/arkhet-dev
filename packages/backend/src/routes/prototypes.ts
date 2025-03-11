import { Hono } from "hono";
import { db } from "../../db/db";
import { assertIsParsableInt } from "./projects";
import { mightFail } from "might-fail";
import { prototypes as prototypesTable } from "../../db/schemas/prototypes";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { zValidator } from "@hono/zod-validator";

export const prototypeRouter = new Hono()
  .get("/", async (c) => {
    const { result: prototypeQueryResult, error: prototypeQueryError } =
      await mightFail(db.select().from(prototypesTable));

    if (prototypeQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching prototypes.",
        cause: prototypeQueryError,
      });
    }
    return c.json({ prototypes: prototypeQueryResult });
  })
  .get("/:projectId", async (c) => {
    const { projectId: projectIdString } = c.req.param();
    const projectId = assertIsParsableInt(projectIdString);

    const { result: prototypeQueryResult, error: prototypeQueryError } =
      await mightFail(
        db
          .select()
          .from(prototypesTable)
          .where(eq(prototypesTable.projectId, projectId))
      );

    if (prototypeQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching projects.",
        cause: prototypeQueryError,
      });
    }
    return c.json({ prototype: prototypeQueryResult });
  })
  .get("/:prototypeId/read", async (c) => {
    const { prototypeId: prototypeIdString } = c.req.param();
    const prototypeId = assertIsParsableInt(prototypeIdString);

    const { result: prototypeQueryResult, error: prototypeQueryError } =
      await mightFail(
        db
          .select()
          .from(prototypesTable)
          .where(eq(prototypesTable.prototypeId, prototypeId))
      );

    if (prototypeQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching projects.",
        cause: prototypeQueryError,
      });
    }
    return c.json({ prototype: prototypeQueryResult });
  })
  .post(
    "/create",
    zValidator(
      "json",
      createInsertSchema(prototypesTable).omit({
        prototypeId: true,
        createdAt: true,
        active: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      const projectId = insertValues.projectId;
      const { result: newProt, error: prototypeCreationError } =
        await mightFail(
          db
            .insert(prototypesTable)
            .values({ ...insertValues, projectId })
            .returning()
        );

      if (prototypeCreationError) {
        throw new HTTPException(400, {
          cause: prototypeCreationError,
          message: "Error creating prototype.",
        });
      }

      console.log(newProt);

      return c.json({ newProt: newProt[0] }, 200);
    }
  )
  .post("/:prototypeId/delete", async (c) => {
    const { prototypeId: prototypeIdString } = c.req.param();
    const prototypeId = assertIsParsableInt(prototypeIdString);
    const { result: newProt, error: prototypeDeletionError } = await mightFail(
      db
        .update(prototypesTable)
        .set({ active: false })
        .where(eq(prototypesTable.prototypeId, prototypeId))
        .returning()
    );

    if (prototypeDeletionError) {
      throw new HTTPException(400, {
        cause: prototypeDeletionError,
        message: "Error deleting prototype.",
      });
    }

    return c.json({ projectId: newProt[0].projectId }, 200);
  })
  .post(
    "/title/:prototypeId/update",
    zValidator(
      "json",
      createUpdateSchema(prototypesTable).omit({
        active: true,
        projectId: true,
        sourceCode: true,
        createdAt: true,
        prototypeId: true,
      })
    ),
    async (c) => {
      const { prototypeId: prototypeIdString } = c.req.param();
      const prototypeId = assertIsParsableInt(prototypeIdString);
      const updateValues = c.req.valid("json");
      const { error: queryError, result: newPrototypeResult } = await mightFail(
        db
          .update(prototypesTable)
          .set({ ...updateValues })
          .where(eq(prototypesTable.prototypeId, prototypeId))
          .returning()
      );
      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating prototypes table",
          cause: queryError,
        });
      }
      return c.json({ newPrototype: newPrototypeResult[0] }, 200);
    }
  )
  .post(
    "/:prototypeId/update",
    zValidator(
      "json",
      createUpdateSchema(prototypesTable).omit({
        active: true,
        projectId: true,
        createdAt: true,
        prototypeId: true,
      })
    ),
    async (c) => {
      const { prototypeId: prototypeIdString } = c.req.param();
      const prototypeId = assertIsParsableInt(prototypeIdString);
      const updateValues = c.req.valid("json");

      const { error: queryError, result: newPrototypeResult } = await mightFail(
        db
          .update(prototypesTable)
          .set({ ...updateValues })
          .where(eq(prototypesTable.prototypeId, prototypeId))
          .returning()
      );

      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating prototypes table",
          cause: queryError,
        });
      }

      return c.json({ newPrototype: newPrototypeResult[0] }, 200);
    }
  );
