import { queryOptions } from "@tanstack/react-query";
import { client } from "./client";
import { User } from "@backend/db/schemas/users";
import type { ExtractData } from "./projects";

async function getCurrentUser() {
  const res = await client.api["v0"].auth.me.$get();

  if (!res.ok) {
    throw new Error("Error getting user"); // would like a better error handling setup
  }
  const { user } = await res.json();
  return { user: mapSerializedUserToSchema(user) };
}

export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});

type SerializedUser = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.auth.me.$get>>
>["user"];

function mapSerializedUserToSchema(serializedUser: SerializedUser): User {
  return {
    ...serializedUser,
    createdAt: new Date(serializedUser.createdAt),
  };
}
