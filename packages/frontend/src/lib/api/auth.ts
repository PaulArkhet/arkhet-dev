import { queryOptions } from "@tanstack/react-query";
import { client } from "./client";
import { User } from "@backend/db/schemas/users";
import type { ExtractData } from "./projects";

async function getCurrentUser() {
  const res = await client.api["v0"].auth.me.$get();

  if (!res.ok) {
    throw new Error("Error getting user"); // would like a better error handling setup
  }
  const response = await res.json();

  if (response.type === "valid") {
    return {
      user: mapSerializedUserToSchema(response.user),
      type: response.type,
    };
  } else {
    return response;
  }
}

export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});

type SerializedUser = Extract<
  ExtractData<Awaited<ReturnType<typeof client.api.v0.auth.me.$get>>>,
  { type: "valid" }
>["user"];

function mapSerializedUserToSchema(serializedUser: SerializedUser): User {
  return {
    ...serializedUser,
    createdAt: new Date(serializedUser.createdAt),
  };
}
