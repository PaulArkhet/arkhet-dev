import { hc } from "hono/client";
import { ApiRoutes } from "@backend/src/app";

export const client = hc<ApiRoutes>("https://arkhet-dev.onrender.com");
