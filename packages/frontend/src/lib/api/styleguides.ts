import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "./client";
import { ArgumentTypes, ExtractData } from "./projects";
import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";

async function getAllStyleguides() {
  const res = await client.api.v0.styleguides.$get();
  if (!res.ok) {
    throw new Error("Failed to get all styleguides");
  }
  const { styleguideQueryResult } = await res.json();
  return styleguideQueryResult.map(mapSerializedStyleguideToSchema);
}

export const getAllStyleguidesQueryOptions = queryOptions({
  queryKey: ["styleguides"],
  queryFn: getAllStyleguides,
});

type SerializedStyleguide = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.styleguides.$get>>
>["styleguideQueryResult"][number];

type CreateStyleguideArgs = ArgumentTypes<
  typeof client.api.v0.styleguides.create.$post
>[0]["json"];

async function createStyleguide(args: CreateStyleguideArgs) {
  const res = await client.api.v0.styleguides.create.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error creating styleguide");
  }
  const fullStyleguideRes = await client.api.v0.styleguides.$get();
  if (!res.ok) {
    throw new Error("Error creating styleguide");
  }

  const { styleguideQueryResult } = await fullStyleguideRes.json();

  return mapSerializedStyleguideToSchema(styleguideQueryResult[0]);
}

export const useCreateStyleguideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStyleguide,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["styleguides"] });
    },
  });
};

const updateFunc = client.api.v0.styleguides[":styleguideId"].update.$post;

type UpdateStyleguideArgs = ArgumentTypes<typeof updateFunc>[0]["json"] & {
  styleguideId: number;
};

async function updateStyleguide(args: UpdateStyleguideArgs) {
  console.log("update styleguiode called", args);
  const res = await client.api.v0.styleguides[":styleguideId"].update.$post({
    json: args,
    param: { styleguideId: args.styleguideId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error while updating styleguide");
  }

  const { updatedStyleguide } = await res.json();
  return updatedStyleguide;
}

export const useUpdateStyleguideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStyleguide,
    onMutate: async (newStyleguide) => {
      await queryClient.cancelQueries({
        queryKey: ["styleguides", newStyleguide.styleguideId],
      });

      // Snapshot the previous value
      const previousStyleguide = queryClient.getQueryData([
        "styleguides",
        newStyleguide.styleguideId,
      ]);

      const previousStyleguides = queryClient.getQueryData([
        "styleguides",
      ]) as StyleguideWithJoins[];

      const newStyleguideUpdateResult: StyleguideWithJoins = deepMerge(
        previousStyleguides[0],
        {
          ...newStyleguide,
          editedAt: new Date(Date.now()),
        }
      );
      /*
      const newStyleguideUpdateResult: StyleguideWithJoins = {
        ...(previousStyleguide as StyleguideWithJoins),
        ...newStyleguide,
        editedAt: new Date(Date.now()),
      };
      */

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["styleguides", newStyleguide.styleguideId],
        newStyleguideUpdateResult
      );

      const syleguideToUpdateIndex = previousStyleguides.findIndex(
        (styleguide) => styleguide.styleguideId === newStyleguide.styleguideId
      );
      if (syleguideToUpdateIndex === -1) return;

      const newStyleguides = previousStyleguides.toSpliced(
        syleguideToUpdateIndex,
        1,
        newStyleguideUpdateResult
      );

      queryClient.setQueryData(["styleguides"], newStyleguides);

      // Return a context with the previous and new todo
      return { previousStyleguide, previousStyleguides };
    },
    onSettled: (newStyleguide) => {
      if (!newStyleguide) return;
      queryClient.invalidateQueries({
        queryKey: ["projects", newStyleguide.styleguideId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (_err, vars, context) => {
      console.error(_err);
      if (!context) return;
      queryClient.setQueryData(
        ["projects", vars.styleguideId],
        context.previousStyleguide
      );

      queryClient.setQueryData(["projects"], context.previousStyleguides);
    },
  });
};

function mapSerializedStyleguideToSchema(
  serializedStyleguide: SerializedStyleguide
): StyleguideWithJoins {
  return {
    ...serializedStyleguide,
    editedAt: new Date(serializedStyleguide.editedAt),
    createdAt: new Date(serializedStyleguide.createdAt),
  };
}

/**
 * A type that makes all properties of T deeply optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deeply merges `source` into `target`, returning a new object.
 * Only non-undefined values in `source` will overwrite properties in `target`.
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: DeepPartial<T>
): T {
  console.log(target);
  // Create a shallow clone of `target` to avoid mutating it
  const result: T = { ...target };

  // Iterate through keys in source
  for (const key in source) {
    // Only process if source[key] is not undefined
    if (source[key] !== undefined) {
      const sourceValue = source[key];
      const targetValue = target[key];

      // If both target and source values are objects (and not arrays), recurse
      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue,
          sourceValue as DeepPartial<T[typeof key]>
        );
      } else {
        // Otherwise, overwrite directly
        result[key] = sourceValue as T[typeof key];
      }
    }
  }

  return result;
}
