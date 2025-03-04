import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "./client";
import { Project } from "@backend/db/schemas/projects";
import type { ClientResponse } from "hono/client";

export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;

async function getAllProjects() {
  const res = await client.api.v0.projects.$get();
  if (!res.ok) {
    throw new Error("Error getting projects"); // would like a better error handling setup
  }
  const projects = await res.json();
  return projects.map(mapSerializedProjectToSchema);
}

export const getProjectsQueryOptions = queryOptions({
  queryKey: ["projects"],
  queryFn: getAllProjects,
});

type CreateProjArgs = ArgumentTypes<
  typeof client.api.v0.projects.create.$post
>[0]["json"];

async function createProject(args: CreateProjArgs) {
  const res = await client.api.v0.projects.create.$post({ json: args });
  if (!res.ok) {
    throw new Error("Error creating project");
  }
  const result = await res.json();
  return result.newProj[0];
}

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onMutate: async (args) => {
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData([
        "projects",
      ]) as Project[];

      const newProjects = [
        {
          title: args.title,
          imgSrc: args.imgSrc,
          active: true,
          createdAt: new Date(Date.now()),
          editedAt: new Date(Date.now()),
          projectId: 0,
        },
        ...previousProjects,
      ];
      // Optimistically update to the new value
      queryClient.setQueryData(["projects"], newProjects);

      // Return a context with the previous and new todo
      return { previousProjects, newProjects };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(["projects"], context.previousProjects);
    },
  });
};

const updateFunc = client.api.v0.projects[":projectId"].update.$post;

type UpdateProjectArgs = ArgumentTypes<typeof updateFunc>[0]["json"] & {
  projectId: number;
};

async function updateProject(args: UpdateProjectArgs) {
  const res = await client.api.v0.projects[":projectId"].update.$post({
    param: { projectId: args.projectId.toString() },
    json: args,
  });
  if (!res.ok) {
    throw new Error("Error creating project.");
  }
  const { newProject } = await res.json();
  return newProject;
}

export const useUpdateProjectMutation = () => {
  return useMutation({
    mutationFn: updateProject,
  });
};

export type ExtractData<T> =
  T extends ClientResponse<infer Data, any, any> ? Data : never;

type SerializedProject = ExtractData<
  Awaited<ReturnType<typeof client.api.v0.projects.$get>>
>[number];

async function getProjectById(projectId: number) {
  const res = await client.api.v0.projects[":projectId"].$get({
    param: { projectId: projectId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error getting project by id");
  }
  const { project } = await res.json();
  return mapSerializedProjectToSchema(project);
}

export const getProjectByIdQueryOptions = (projectId: number) =>
  queryOptions({
    queryKey: ["projects", projectId],
    queryFn: () => getProjectById(projectId),
  });

async function deleteProjectById(projectId: number) {
  const res = await client.api.v0.projects[":projectId"].delete.$post({
    param: { projectId: projectId.toString() },
  });
  if (!res.ok) {
    throw new Error("Error getting project by id");
  }
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProjectById,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onMutate: async (args) => {
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData([
        "projects",
      ]) as Project[];

      const projToDeleteIndex = previousProjects.findIndex(
        (proj) => proj.projectId === args
      );
      if (projToDeleteIndex === -1) return;

      const newProjects = previousProjects.toSpliced(projToDeleteIndex, 1);
      // Optimistically update to the new value
      queryClient.setQueryData(["projects"], newProjects);

      // Return a context with the previous and new todo
      return { previousProjects, newProjects };
    },
    onError: (_err, _args, context) => {
      if (!context) return;
      queryClient.setQueryData(["projects"], context.previousProjects);
    },
  });
};

function mapSerializedProjectToSchema(serializedProject: SerializedProject) {
  return {
    ...serializedProject,
    createdAt: new Date(serializedProject.createdAt),
    editedAt: new Date(serializedProject.editedAt),
  };
}
