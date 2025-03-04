import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "./client";
import { ArgumentTypes, ExtractData } from "./projects";
import { Dataset } from "@backend/db/schemas/datasets";

async function getAllDatasets() {
  const res = await client.api.v0.datasets.$get();
  if (!res.ok) {
    throw new Error("Failed to get all datasets");
  }
  const { datasets } = await res.json();
  return datasets.map(mapSerializedDatasetToSchema);
}

export const getAllDatasetsQueryOptions = queryOptions({
  queryKey: ["datasets"],
  queryFn: getAllDatasets,
});

type SerializedDataset = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.datasets.$get>>
>["datasets"][number];

type CreateDatasetArgs = ArgumentTypes<
  typeof client.api.v0.datasets.create.$post
>[0]["json"];

async function createDataset(args: CreateDatasetArgs) {
  const res = await client.api.v0.datasets.create.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error creating dataset");
  }
  const result = await res.json();
  return mapSerializedDatasetToSchema(result.dataset);
}

export const useCreateDatasetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDataset,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
};

export async function createAsset(args: FormData) {
  const res = await client.api.v0.datasets.upload.$post({ body: args });
  if (!res.ok) {
    const errorText = await res.text(); // Get backend error response
    console.error("Error response:", errorText);
    throw new Error(`Error uploading file: ${res.status}`);
  }
  return await res.json();
}

// export const useCreateAssetMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: createAsset,
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["assets"] });
//     },
//   });
// };

function mapSerializedDatasetToSchema(
  serializedDataset: SerializedDataset
): Dataset {
  return {
    ...serializedDataset,
    editedAt: new Date(serializedDataset.editedAt),
    createdAt: new Date(serializedDataset.createdAt),
  };
}
