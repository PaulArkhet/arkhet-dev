import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "./db/drizzle",
  schema: "./db/schemas/*",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DEV_CONNECTIONSTRING!,
  },
});
