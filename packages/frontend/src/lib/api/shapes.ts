import { ShapeVariations, Wireframe } from "@backend/src/interfaces/artboard";
import { v4 as uuid } from "uuid";
import { client } from "./client";
import { match } from "ts-pattern";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ArgumentTypes } from "./projects";
import { MutableRefObject } from "react";
import { getCurrentViewCenter } from "@/utils/helpers";

async function getAllShapesForProject(projectId: number): Promise<Wireframe[]> {
  const res = await client.api.v0.shapes[":projectId"].$get({
    param: { projectId: projectId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error while getting shapes for project");
  }

  const { parsedShapesQueryResult } = await res.json();
  console.log("response from query/all shapes:", parsedShapesQueryResult);
  return parsedShapesQueryResult;
}

export const getAllShapesForProjectQueryOptions = (projectId: number) =>
  queryOptions({
    queryKey: ["shapes", projectId],
    queryFn: () => getAllShapesForProject(projectId),
    staleTime: 5000,
  });

type CreateShapeArgs = {
  type: ShapeVariations["type"];
  projectId: number;
  shapeId: string;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
  scale: number;
  shapeCount: number;
};

async function createShape(createShapeArgs: CreateShapeArgs) {
  const viewCenter = getCurrentViewCenter(createShapeArgs.canvasRef);

  const positionedShape = getDefaultShapeProps(
    createShapeArgs.type,
    createShapeArgs.shapeCount,
    createShapeArgs.scale,
    viewCenter,
    createShapeArgs.projectId,
    createShapeArgs.shapeId
  );

  console.log("Creating shape: ", positionedShape);
  const res = await client.api.v0.shapes.create.$post({
    json: positionedShape,
  });

  if (!res.ok) {
    throw new Error("Error while creating shape");
  }

  const { shape } = await res.json();
  return shape;
}

export const useCreateShapeMutation = (projectId: number) => {
  const queryClient = useQueryClient();
  const queryKey = ["shapes", projectId];

  return useMutation({
    mutationFn: (args: Omit<CreateShapeArgs, "shapeCount">) => {
      const allShapes = queryClient.getQueryData<Wireframe[] | undefined>(
        queryKey
      );

      if (!allShapes) {
        throw new Error("No shapes...");
      }
      const shapeCount = allShapes ? allShapes.length : 0;

      return createShape({ ...args, shapeCount });
    },
    // When mutate is called:
    onMutate: async (newShapeArgs) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous shapes
      const previousShapes =
        queryClient.getQueryData<Wireframe[]>(queryKey) || [];

      const allShapes = queryClient.getQueryData<Wireframe[] | undefined>(
        queryKey
      );
      const shapeCount = allShapes ? allShapes.length : 0;

      const viewCenter = getCurrentViewCenter(newShapeArgs.canvasRef);
      const shape = getDefaultShapeProps(
        newShapeArgs.type,
        shapeCount,
        newShapeArgs.scale,
        viewCenter,
        projectId,
        newShapeArgs.shapeId
      );

      if (!allShapes) {
        console.error("No shapes, returning...");
        return Promise.resolve();
      }

      // Optimistically update the query cache.
      queryClient.setQueryData<Wireframe[]>(queryKey, [
        ...previousShapes,
        shape,
      ]);

      // Return context for potential rollback.
      return { previousShapes, newShape: shape };
    },
    onError: (err, _newShapeArgs, context) => {
      // Roll back to the previous shapes on error.
      if (context?.previousShapes) {
        queryClient.setQueryData<Wireframe[]>(
          ["shapes", projectId],
          context.previousShapes
        );
      }
      console.error("Error creating shape:", err);
    },
    onSettled: () => {
      // Always refetch after error or success.
      queryClient.invalidateQueries({ queryKey: ["shapes", projectId] });
    },
  });
};

const updateClientFunction = client.api.v0.shapes[":shapeId"];

type UpdateShapeArgs = ArgumentTypes<
  typeof updateClientFunction.update.$post
>[0]["json"];

const retryDelay = 500;
const retryLimit = 10;

async function updateShape(
  updateShapeArgs: {
    args: UpdateShapeArgs;
    shapeId: string;
  },
  retryCount: number = 0
) {
  console.log("Updating shape:", updateShapeArgs);
  const res = await updateClientFunction.update.$post({
    json: updateShapeArgs.args,
    param: { shapeId: updateShapeArgs.shapeId.toString() },
  });

  if (res.status === 404) {
    if (retryCount === retryLimit) throw new Error("Shape update timeout.");
    const delay = (retryCount + 1) * (2 * retryDelay);
    console.log("Sleeping for ", delay, " milliseconds");
    await new Promise((resolve) => setTimeout(resolve, delay));
    console.log("Retrying...");
    return updateShape(updateShapeArgs, retryCount + 1);
  }

  if (!res.ok) {
    throw new Error("Error while updating shape");
  }
}

// Optimistic updateShape mutation
export const useUpdateShapeMutation = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShape,
    onMutate: async (updateArgs) => {
      await queryClient.cancelQueries({ queryKey: ["shapes", projectId] });
      // Snapshot the previous state for this shape.
      const previousShapes =
        queryClient.getQueryData<Wireframe[]>(["shapes", projectId]) || [];
      const previousShape = previousShapes.find(
        (shape) => shape.id === updateArgs.shapeId
      );

      // if (updateArgs.shapeId > Date.now() / 10) {
      //   console.log("queuing update...");
      //   enqueueUpdate(updateArgs.shapeId, updateArgs.args);
      // }
      // Optimistically update the cache.
      queryClient.setQueryData<Wireframe[]>(
        ["shapes", projectId],
        // @ts-expect-error
        (oldShapes) =>
          oldShapes
            ? oldShapes.map((shape) =>
                shape.id === updateArgs.shapeId
                  ? { ...shape, ...updateArgs.args }
                  : shape
              )
            : []
      );
      return { previousShapes, previousShape };
    },
    onError: (err, _updateArgs, context) => {
      if (context?.previousShapes) {
        queryClient.setQueryData<Wireframe[]>(
          ["shapes", projectId],
          context.previousShapes
        );
      }
      console.error("Error updating shape:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shapes", projectId] });
    },
  });
};

async function deleteShape(shapeId: string) {
  const res = await client.api.v0.shapes[":shapeId"].delete.$post({
    param: { shapeId: shapeId.toString() },
  });

  if (!res.ok) {
    throw new Error("Error while deleting shape");
  }
}

export const useDeleteShapeMutation = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShape,
    onMutate: async (shapeId) => {
      await queryClient.cancelQueries({ queryKey: ["shapes", projectId] });
      // Snapshot the current shapes.
      const previousShapes =
        queryClient.getQueryData<Wireframe[]>(["shapes", projectId]) || [];
      // Optimistically remove the shape from the cache.
      queryClient.setQueryData<Wireframe[]>(
        ["shapes", projectId],
        (oldShapes) =>
          oldShapes ? oldShapes.filter((shape) => shape.id !== shapeId) : []
      );
      return { previousShapes };
    },
    onError: (err, _shapeId, context) => {
      if (context?.previousShapes) {
        queryClient.setQueryData<Wireframe[]>(
          ["shapes", projectId],
          context.previousShapes
        );
      }
      console.error("Error deleting shape:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shapes", projectId] });
    },
  });
};
function getDimensionPropsForShape(type: ShapeVariations["type"]): {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number | null;
  maxHeight: number | null;
} {
  return {
    maxWidth: null,
    maxHeight: null,
    ...match(type)
      .with("page", () => ({
        width: 1000, // 800 * 2
        height: 562, // 448 * 2
        minWidth: 461,
        minHeight: 562,
        maxWidth: 1000,
      }))
      .with("button", () => ({
        width: 49,
        height: 20,
        minWidth: 49,
        minHeight: 20,
      }))
      .with("inputField", () => ({
        width: 105,
        height: 30,
        minWidth: 105,
        minHeight: 30,
      }))
      .with("text", () => ({
        width: 150,
        height: 50,
        minWidth: 49,
        minHeight: 20,
      }))
      .with("checkbox", () => ({
        width: 105,
        height: 40,
        minWidth: 105,
        minHeight: 40,
      }))
      .with("radio", () => ({
        width: 70,
        height: 50,
        minWidth: 70,
        minHeight: 50,
      }))
      .with("toggle", () => ({
        width: 30,
        height: 30,
        minWidth: 30,
        minHeight: 30,
      }))
      .with("card", () => ({
        width: 100,
        height: 100,
        minWidth: 30,
        minHeight: 30,
      }))
      .with("image", () => ({
        width: 50,
        height: 50,
        minWidth: 30,
        minHeight: 30,
      }))
      .with("dropdown", () => ({
        width: 70,
        height: 25,
        minWidth: 70,
        minHeight: 25,
      }))
      .with("circle", () => ({
        width: 50,
        height: 50,
        minWidth: 30,
        minHeight: 30,
      }))
      .with("divider", () => ({
        width: 100,
        height: 25,
        minWidth: 50,
        minHeight: 25,
      }))
      .with("chatbot", () => ({
        width: 250,
        height: 150,
        minWidth: 100,
        minHeight: 150,
      }))
      .with("navigation", () => ({
        width: 70,
        height: 30,
        minWidth: 70,
        minHeight: 25,
      }))
      .with("instance", () => ({
        width: 100,
        height: 100,
        minWidth: 10,
        minHeight: 10,
      }))
      .with("rectangle", () => ({
        width: 100,
        height: 100,
        minWidth: 10,
        minHeight: 10,
      }))
      .exhaustive(),
  };
}

function getDefaultShapeProps<T extends ShapeVariations["type"]>(
  type: T,
  shapeCount: number,
  scale: number,
  viewCenter: { x: number; y: number },
  projectId: number,
  newShapeId: string,
  parentId?: string
): Wireframe {
  const dimensionProps = getDimensionPropsForShape(type);
  const baseProps = {
    ...dimensionProps,
    id: newShapeId,
    shapeId: newShapeId,
    isInstanceChild: false,
    zIndex: shapeCount + 1,
    xOffset: viewCenter.x / scale - dimensionProps.width / 2,
    yOffset: viewCenter.y / scale - dimensionProps.height / 2,
    projectId,
  };
  let shape: Wireframe;

  switch (type) {
    case "page": {
      const page: Extract<Wireframe, { type: "page" }> = {
        ...baseProps,
        subtype: "Desktop",
        title: "New Page",
        description:
          "Add a description here to help our AI system better understand your page",
        type: "page",
      };
      shape = page;
      break;
    }
    case "button": {
      const button: Extract<Wireframe, { type: "button" }> = {
        ...baseProps,
        title: "Confirm",
        subtype: "Primary",
        size: "Medium",
        type: "button",
      };
      shape = button;
      break;
    }
    case "inputField": {
      const inputField: Extract<Wireframe, { type: "inputField" }> = {
        ...baseProps,
        title: "Input Field",
        type: "inputField",
      };
      shape = inputField;
      break;
    }
    case "text": {
      const text: Extract<Wireframe, { type: "text" }> = {
        ...baseProps,
        fontSize: "text-sm",
        fontColor: "text-white",
        content: "Double click to edit...",
        type: "text",
      };
      shape = text;
      break;
    }
    case "checkbox": {
      const checkbox: Extract<Wireframe, { type: "checkbox" }> = {
        ...baseProps,
        subtype: "column",
        label: "",
        options: [
          {
            optionId: uuid(),
            shapeId: newShapeId,
            label: "Item 1",
            isTicked: false,
            order: 0,
          },
          {
            optionId: uuid(),
            shapeId: newShapeId,
            label: "Item 2",
            isTicked: false,
            order: 1,
          },
        ],
        type: "checkbox",
      };
      shape = checkbox;
      break;
    }
    case "radio": {
      const radio: Extract<Wireframe, { type: "radio" }> = {
        ...baseProps,
        subtype: "column",
        label: "",
        option1: "Item 1",
        option2: "Item 2",
        option3: "Item 3",
        type: "radio",
      };
      shape = radio;
      break;
    }
    case "toggle": {
      const toggle: Extract<Wireframe, { type: "toggle" }> = {
        ...baseProps,
        type: "toggle",
      };
      shape = toggle;
      break;
    }
    case "card": {
      const card: Extract<Wireframe, { type: "card" }> = {
        ...baseProps,
        title: "New Component",
        description:
          "Add a description here to help our AI system better understand your page",
        hasInstances: false,
        type: "card",
        childrenComponents: [],
      };
      shape = card;
      break;
    }
    case "image": {
      const image: Extract<Wireframe, { type: "image" }> = {
        ...baseProps,
        type: "image",
      };
      shape = image;
      break;
    }
    case "dropdown": {
      const dropdown: Extract<Wireframe, { type: "dropdown" }> = {
        ...baseProps,
        iconSrc: "",
        option1: "Option 1",
        option2: "Option 2",
        option3: "Option 3",
        type: "dropdown",
      };
      shape = dropdown;
      break;
    }
    case "circle": {
      const circle: Extract<Wireframe, { type: "circle" }> = {
        ...baseProps,
        type: "circle",
      };
      shape = circle;
      break;
    }
    case "chatbot": {
      const chatbot: Extract<Wireframe, { type: "chatbot" }> = {
        ...baseProps,
        type: "chatbot",
      };
      shape = chatbot;
      break;
    }
    case "divider": {
      const divider: Extract<Wireframe, { type: "divider" }> = {
        ...baseProps,
        thickness: 2,
        type: "divider",
      };
      shape = divider;
      break;
    }
    case "navigation": {
      const navigation: Extract<Wireframe, { type: "navigation" }> = {
        ...baseProps,
        content: "",
        fontColor: "text-white",
        fontSize: "text-md",
        type: "navigation",
      };
      shape = navigation;
      break;
    }
    case "instance": {
      const instance: Extract<Wireframe, { type: "instance" }> = {
        ...baseProps,
        // parentId is required—provide it separately when creating the instance shape
        parentId: parentId!,
        type: "instance",
      };
      shape = instance;
      break;
    }
    case "rectangle": {
      const rectangle: Extract<Wireframe, { type: "rectangle" }> = {
        ...baseProps,
        type: "rectangle",
      };
      shape = rectangle;
      break;
    }
    default:
      throw new Error(`Unsupported shape type: ${type}`);
  }

  return { ...shape };
}
