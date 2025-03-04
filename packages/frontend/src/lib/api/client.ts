import { hc } from "hono/client";
import { ApiRoutes } from "@backend/src/app";

export const client = hc<ApiRoutes>(import.meta.env.VITE_DOMAIN!);
