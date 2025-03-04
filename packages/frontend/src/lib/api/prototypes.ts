import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes, ExtractData } from "./projects";
import { client } from "./client";
import { Prototype } from "@backend/db/schemas/prototypes";

async function getPrototypesByProjectId(projectId: string) {
  const res = await client.api.v0.prototypes[":projectId"].$get({
    param: { projectId },
  });
  if (!res.ok) {
    throw new Error("Error getting prototypes");
  }
  const { prototype } = await res.json();
  return prototype.map(mapSerializedPrototypeToSchema);
}

export const getPrototypesByProjectIdQueryOptions = (projectId: number) =>
  queryOptions({
    queryKey: ["prototypes", projectId],
    queryFn: () => getPrototypesByProjectId(projectId.toString()),
  });

async function getPrototypesByPrototypeId(prototypeId: string) {
  const res = await client.api.v0.prototypes[":prototypeId"].read.$get({
    param: { prototypeId },
  });
  if (!res.ok) {
    throw new Error("Error getting prototypes");
  }
  const { prototype } = await res.json();
  return prototype.map(mapSerializedPrototypeToSchema);
}

export const getPrototypesByPrototypeIdQueryOptions = (prototypeId: number) =>
  queryOptions({
    queryKey: ["prototypes", prototypeId],
    queryFn: () => getPrototypesByPrototypeId(prototypeId.toString()),
  });

type CreatePrototypeArgs = ArgumentTypes<
  typeof client.api.v0.prototypes.create.$post
>[0]["json"];

type SerializedPrototype = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.prototypes.$get>>
>["prototypes"][number];

function mapSerializedPrototypeToSchema(
  serializedPrototype: SerializedPrototype
): Prototype {
  const mappedPrototype = {
    ...serializedPrototype,
    createdAt: new Date(serializedPrototype.createdAt),
  };
  return mappedPrototype;
}

async function createPrototype(args: CreatePrototypeArgs) {
  console.log("creating prototype");
  const res = await client.api.v0.prototypes.create.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error creating prototype");
  }
  const result = await res.json();
  console.log("Parsed API Response:", result);
  return mapSerializedPrototypeToSchema(result.newProt);
}

export const useCreatePrototypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPrototype,
    onSettled: (args) => {
      console.log(args);
      if (!args) return console.log(args, "create args, retruning");
      queryClient.invalidateQueries({ queryKey: ["prototypes"] });
      queryClient.invalidateQueries({
        queryKey: ["prototypes", args.projectId],
      });
    },
  });
};

const updateFunc = client.api.v0.prototypes[":prototypeId"].update.$post;

type UpdatePrototypeArgs = ArgumentTypes<typeof updateFunc>[0];

async function updatePrototype(args: UpdatePrototypeArgs) {
  const res = await client.api.v0.prototypes[":prototypeId"].update.$post({
    param: { prototypeId: args.param.prototypeId.toString() },
    json: args.json,
  });
  if (!res.ok) {
    throw new Error("Error creating project.");
  }
  const { newPrototype } = await res.json();
  console.log(newPrototype);
  return newPrototype;
}

export const useUpdatePrototypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePrototype,
    onSettled: (newPrototype) => {
      if (!newPrototype) return;
      queryClient.invalidateQueries({
        queryKey: ["prototypes", newPrototype.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["prototypes"],
      });
    },
  });
};
