import { z } from "zod";
import { mightFail, mightFailSync } from "might-fail";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../db/db";
import { projects as projectsTable } from "../../db/schemas/projects";
import { and, desc, eq } from "drizzle-orm";
import { getUser } from "../services/kinde.service";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export function assertIsParsableInt(id: string): number {
  const { result: parsedId, error: parseIdError } = mightFailSync(() =>
    z.coerce.number().int().parse(id)
  );

  if (parseIdError) {
    throw new HTTPException(400, {
      message: `Id ${id} cannot be parsed into a number.`,
      cause: parseIdError,
    });
  }

  return parsedId;
}

export const projectRouter = new Hono()
  .use(getUser)
  .get("/", async (c) => {
    const { userId } = c.var.dbUser;

    const { result: projectsQueryResult, error: queryError } = await mightFail(
      db
        .select()
        .from(projectsTable)
        .where(
          and(eq(projectsTable.userId, userId), eq(projectsTable.active, true))
        )
        .orderBy(desc(projectsTable.editedAt))
    );

    if (queryError) {
      throw new HTTPException(500, {
        message: "Error when querying projects.",
        cause: queryError,
      });
    }

    return c.json(projectsQueryResult, 200);
  })
  .get("/:projectId", async (c) => {
    const { projectId: projectIdString } = c.req.param();
    const projectId = assertIsParsableInt(projectIdString);

    const { result: projectQueryResult, error: projectQueryError } =
      await mightFail(
        db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.projectId, projectId))
      );

    if (projectQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching projects.",
        cause: projectQueryError,
      });
    }

    return c.json({ project: projectQueryResult[0] });
  })
  .post(
    "/create",
    zValidator(
      "json",
      createInsertSchema(projectsTable).omit({
        userId: true,
        createdAt: true,
        editedAt: true,
        active: true,
        iterations: true,
        projectId: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { userId } = c.var.dbUser;

      const { result: newProj, error: projectCreationError } = await mightFail(
        db
          .insert(projectsTable)
          .values({ ...insertValues, userId })
          .returning()
      );

      // need to create a starting wireframe here !!!

      if (projectCreationError) {
        throw new HTTPException(400, {
          cause: projectCreationError,
          message: "Error creating project.",
        });
      }

      return c.json({ newProj }, 200);
    }
  )
  .post(
    "/:projectId/update",
    zValidator(
      "json",
      createUpdateSchema(projectsTable).omit({
        userId: true,
        projectId: true,
        editedAt: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const { projectId: projectIdString } = c.req.param();
      const projectId = assertIsParsableInt(projectIdString);

      const updateValues = c.req.valid("json");

      const { error: queryError, result: newProjectResult } = await mightFail(
        db
          .update(projectsTable)
          .set({ ...updateValues, editedAt: new Date() })
          .where(eq(projectsTable.projectId, projectId))
          .returning()
      );

      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating projects table",
          cause: queryError,
        });
      }

      return c.json({ newProject: newProjectResult[0] }, 200);
    }
  )
  .post("/:projectId/delete", async (c) => {
    const { projectId: projectIdString } = c.req.param();
    const projectId = assertIsParsableInt(projectIdString);

    const { error: deleteProjectError } = await mightFail(
      db
        .update(projectsTable)
        .set({ active: false })
        .where(eq(projectsTable.projectId, projectId))
    );

    if (deleteProjectError) {
      throw new HTTPException(500, {
        message: "Error when deleting project.",
        cause: deleteProjectError,
      });
    }

    return c.json({}, 200);
  });
