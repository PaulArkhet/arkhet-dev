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
    throw new Error("Error updating prototype.");
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

async function deletePrototypeById({
  prototypeId,
  projectId,
}: {
  prototypeId: number;
  projectId: number;
}) {
  const res = await client.api.v0.prototypes[":prototypeId"].delete.$post({
    param: { prototypeId: prototypeId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error deleting prototype by id");
  }
  return { prototypeId, projectId: projectId };
}

export const useDeletePrototypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePrototypeById,
    onSettled: (_data, _error, variables) => {
      if (!variables) return;
      const { projectId } = variables;
      queryClient.invalidateQueries({
        queryKey: ["prototypes", projectId],
      });
    },
    onMutate: async (variables) => {
      // Snapshot the previous value
      const { prototypeId, projectId } = variables;
      const previousPrototypes = queryClient.getQueryData([
        "prototypes",
        projectId,
      ]) as Prototype[];

      const protToDeleteIndex = previousPrototypes.findIndex(
        (prot) => prot.prototypeId === prototypeId
      );
      if (protToDeleteIndex === -1) return;

      const newPrototypes = previousPrototypes.toSpliced(protToDeleteIndex, 1);
      // Optimistically update to the new value
      queryClient.setQueryData(["prototypes", projectId], newPrototypes);

      // Return a context with the previous and new todo
      return { previousPrototypes, newPrototypes };
    },
    onError: (_err, _args, context) => {
      if (!context) return;
      queryClient.setQueryData(["prototypes"], context.previousPrototypes);
    },
  });
};

type UpdatePrototypeTitleArgs = ArgumentTypes<typeof updateFunc>[0]["json"] & {
  prototypeId: number;
};

async function updatePrototypeTitle(args: UpdatePrototypeTitleArgs) {
  const res = await client.api.v0.prototypes.title[":prototypeId"].update.$post(
    {
      param: { prototypeId: args.prototypeId.toString() },
      json: args,
    }
  );
  if (!res.ok) {
    throw new Error("Error updating prototype title.");
  }
  const { newPrototype } = await res.json();
  return newPrototype;
}

export const useUpdatePrototypeTitleMutation = () => {
  return useMutation({
    mutationFn: updatePrototypeTitle,
  });
};
