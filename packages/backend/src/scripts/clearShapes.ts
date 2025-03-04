import { db } from "../../db/db";
import { shapes } from "../../db/schemas/shapes/shapes";

if (process.env.NODE_ENV === "dev") {
  console.log("deleting shapes.");
  await db.delete(shapes);
}
