import { hc } from "hono/client";
import { ApiRoutes } from "@backend/src/app";

export const client = hc<ApiRoutes>(
  import.meta.env.NODE_ENV === "dev"
    ? import.meta.env.VITE_DEV_DOMAIN
    : import.meta.env.NODE_ENV === "staging"
      ? import.meta.env.VITE_STAGING_DOMAIN
      : import.meta.env.VITE_DOMAIN
);
