import { Hono } from "hono";
import { mightFail } from "might-fail";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { zValidator } from "@hono/zod-validator";
import { datasets as datasetsTable } from "../../db/schemas/datasets";
import { db } from "../../db/db";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { getUser } from "../services/kinde.service";
import { assertIsParsableInt } from "./projects";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { serve } from "@hono/node-server";

const s3 = new S3Client({ region: process.env.S3_AWS_REGION });

export const datasetRouter = new Hono()
  .use(getUser)
  .post("/upload", async (c) => {
    console.log("hit function");
    console.log("Content-Type:", c.req.header("Content-Type"));
    const { userId } = c.var.dbUser;
    const formData = await c.req.formData();
    console.log(formData);
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    if (!file) {
      throw new HTTPException(400, { message: "No file uploaded" });
    }
    console.log("File received:", file);
    console.log("Title:", title);
    const fileKey = `${uuidv4()}-${file.name}`;
    const uploadParams = {
      Bucket: process.env.S3_AWS_BUCKET!,
      Key: fileKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };
    if (!uploadParams.Bucket) {
      throw new Error("Bucket name is not defined");
    }
    const { error: s3Error } = await mightFail(
      s3.send(new PutObjectCommand(uploadParams))
    );
    if (s3Error) {
      throw new HTTPException(500, {
        message: "S3 upload failed",
        cause: s3Error,
      });
    }
    const { error: dbError, result: dbResult } = await mightFail(
      db
        .insert(datasetsTable)
        .values({ userId, title, content: fileKey })
        .returning()
    );
    if (dbError) {
      throw new HTTPException(500, {
        message: "Database insert failed",
        cause: dbError,
      });
    }
    return c.json({ dataset: dbResult[0] }, 200);
  })
  .get("/", async (c) => {
    const { userId } = c.var.dbUser;

    const { error: datasetsQueryError, result: datasetsQueryResult } =
      await mightFail(
        db.select().from(datasetsTable).where(eq(datasetsTable.userId, userId))
      );

    if (datasetsQueryError) {
      throw new HTTPException(500, {
        message: "Error while fetching datasets",
        cause: datasetsQueryError,
      });
    }

    return c.json({ datasets: datasetsQueryResult }, 200);
  })
  .get("/:datasetId", async (c) => {
    const { datasetId: datasetIdString } = c.req.param();
    const datasetId = assertIsParsableInt(datasetIdString);

    const { result: datatsetQueryResult, error: datasetQueryError } =
      await mightFail(
        db
          .select()
          .from(datasetsTable)
          .where(eq(datasetsTable.datasetId, datasetId))
      );

    if (datasetQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching dataset.",
        cause: datasetQueryError,
      });
    }

    return c.json({ dataset: datatsetQueryResult[0] });
  })
  .post(
    "/create",
    zValidator(
      "json",
      createInsertSchema(datasetsTable).omit({
        userId: true,
        editedAt: true,
        createdAt: true,
        active: true,
      })
    ),
    async (c) => {
      const { userId } = c.var.dbUser;

      const insertValues = c.req.valid("json");
      const { error: datasetInsertError, result: datasetInsertResult } =
        await mightFail(
          db
            .insert(datasetsTable)
            .values({ ...insertValues, userId })
            .returning()
        );

      if (datasetInsertError) {
        throw new HTTPException(500, {
          message: "Error while creating dataset",
          cause: datasetInsertError,
        });
      }

      return c.json({ dataset: datasetInsertResult[0] }, 200);
    }
  )
  .post(
    "/:datasetId/update",
    zValidator(
      "json",
      createUpdateSchema(datasetsTable).omit({
        datasetId: true,
        userId: true,
        editedAt: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const newValues = c.req.valid("json");
      const datasetId = assertIsParsableInt(c.req.param().datasetId);
      const { error: updateDatasetError } = await mightFail(
        db
          .update(datasetsTable)
          .set({ ...newValues, editedAt: new Date() })
          .where(eq(datasetsTable.datasetId, datasetId))
      );

      if (updateDatasetError) {
        throw new HTTPException(500, {
          message: "Error updating dataset",
          cause: updateDatasetError,
        });
      }

      return c.json({}, 200);
    }
  )
  .post("/:datasetId/delete", async (c) => {
    const datasetId = assertIsParsableInt(c.req.param().datasetId);
    const { error: deleteDatasetError } = await mightFail(
      db.delete(datasetsTable).where(eq(datasetsTable.datasetId, datasetId))
    );

    if (deleteDatasetError) {
      throw new HTTPException(500, {
        message: "Error deleting dataset.",
        cause: deleteDatasetError,
      });
    }

    return c.json({}, 200);
  });
