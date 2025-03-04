import useArtboardStore from "../../store/ArtboardStore";
import { v4 } from "uuid";
import { MutableRefObject, useContext, useState } from "react";
import { domToPng } from "modern-screenshot";
import {
  isShapeInPage,
  PageNavigation,
  Route,
} from "../../routes/_authenticated/artboard/$projectId";
import { io } from "socket.io-client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { ViewContext } from "../zoom/ViewContext";
import { useGenerationStore } from "../../store/GenerationStore";
import {
  getPrototypesByProjectIdQueryOptions,
  useCreatePrototypeMutation,
} from "@/lib/api/prototypes";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { genParamsSchema, PageStructure } from "@backend/src/controllers/ai";
import { getAllStyleguidesQueryOptions } from "@/lib/api/styleguides";
import { findShape } from "./components/DragAndDropComponent";
import { Wireframe } from "@backend/src/interfaces/artboard";
import { Project } from "@backend/db/schemas/projects";
import { getMultipagePathsQueryOptions } from "@/lib/api/multipage-paths";
import { PermanentPath } from "@backend/src/interfaces/artboard";
import { twMerge } from "tailwind-merge";
import prototypeStore from "@/store/PrototypeStore";
import {
  getAllShapesForProjectQueryOptions,
  useCreateShapeMutation,
} from "@/lib/api/shapes";
import PageIcon from "./components/PageIcon";
import ArrowIcon from "./components/ArrowIcon";
import HandToolIcon from "./components/HandToolIcon";

export function useTriggerGeneration(
  pageRefList: {
    ref: MutableRefObject<HTMLDivElement[]>;
  },
  project: Project,
  permanentPaths: PermanentPath[] | undefined,
  regenerate?: boolean
) {
  const { data: getStyleguidesQuery } = useQuery(getAllStyleguidesQueryOptions);
  const genStore = useGenerationStore();
  const { data: getPrototypesQueryData } = useQuery(
    getPrototypesByProjectIdQueryOptions(project.projectId)
  );

  const { setIsPrototypeReady, setCurrentPrototype } = prototypeStore(
    (state) => state
  );
  const { mutateAsync: createPrototype, isPending } =
    useCreatePrototypeMutation();

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(project.projectId)
  );

  async function handleCreatePrototype() {
    // return;
    if (isPending) return;
    const newPrototype = await createPrototype({
      projectId: project?.projectId || 0,
      sourceCode: "",
      thumbnailImg: "",
    });
    if (newPrototype) {
      console.log("Setting prototype to:", newPrototype);
      setCurrentPrototype(newPrototype);
      setIsPrototypeReady(false);
    }
  }

  async function triggerGeneration() {
    if (permanentPaths === undefined || shapes === undefined) {
      throw new Error("permanent paths or shapes are undefined...");
    }
    console.log("Generation call made...");
    if (!regenerate) {
      console.log("Regenerate triggered...");
      if (getPrototypesQueryData === undefined) {
        console.error("prototypes query data is undefined..., looping");
        return setTimeout(triggerGeneration, 100);
      }
      if (getPrototypesQueryData.length > 0) {
        console.error("No prototypes in query, returning...");
        return;
      }
    }

    if (getStyleguidesQuery === undefined) {
      console.error("styleguides query data is undefined..., looping");
      return setTimeout(triggerGeneration, 100);
    }

    const socket = io({ path: "/ws" });
    genStore.setSocket(socket);
    console.log(pageRefList.ref.current, "haere tehy are");
    const screenshotPromiseArray = pageRefList.ref.current.map((ref) =>
      domToPng(ref)
    );
    const imageList: string[] = await Promise.all(screenshotPromiseArray);
    console.log(imageList, "image list...");

    console.log(pageRefList.ref.current, shapes);
    const allPages = pageRefList.ref.current.map(
      (ref) => findShape(ref.dataset.id!, shapes)!
    );
    console.log(allPages);

    const pageStructure: PageStructure[] = allPages.map((page, index) => {
      console.log(page);
      if (page && page.type !== "page") throw new Error("Not a page?");
      const setup: PageStructure = {
        title: page.title,
        description: page.description,
        id: page.id,
        base64ImageString: imageList[index],
        componentsWithNavigationElements: findAllComponents(page),
      };
      return setup;
    });

    function findAllComponents(page: Extract<Wireframe, { type: "page" }>) {
      if (!shapes) return [];
      if (permanentPaths === undefined) {
        throw new Error("permanent paths is undefined...");
      }
      const shapesResult = shapes.filter((shape) => isShapeInPage(shape, page));
      const shapesNoPages = shapesResult.filter(
        (shape) => shape.type !== "page"
      );
      const shapesNoPagesWithPaths = shapesNoPages
        .map((shape) => {
          const path = permanentPaths.find(
            (path) => path.shapeStartId === shape.id
          );
          return path
            ? { ...shape, path: { targetPageId: path.shapeEndId } }
            : null;
        })
        .filter((page) => page !== null);

      return shapesNoPagesWithPaths;
    }

    const requestBody: z.infer<typeof genParamsSchema> = {
      images: imageList,
      pageStructure,
      styleguide: getStyleguidesQuery[0],
      initialCode: getPrototypesQueryData
        ? getPrototypesQueryData.at(-1)?.sourceCode
        : undefined,
    };

    socket.emit("trigger-generation", requestBody);
    handleCreatePrototype();
  }

  return { triggerGeneration };
}

export default function TopNav(props: {
  pageRefList: {
    ref: MutableRefObject<HTMLDivElement[]>;
  };
  pageContent: PageNavigation;
  setPageContent: React.Dispatch<React.SetStateAction<PageNavigation>>;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
}) {
  const { pageContent, setPageContent, canvasRef } = props;
  const { isHandToolActive, setIsHandToolActive, toggleHandTool } =
    useArtboardStore();
  const { project } = Route.useRouteContext();
  const { mutate: handleAddShape } = useCreateShapeMutation(project.projectId);
  const { data: permanentPaths } = useQuery(
    getMultipagePathsQueryOptions({
      projectId: project.projectId,
    })
  );
  const view = useContext(ViewContext);
  const { triggerGeneration } = useTriggerGeneration(
    props.pageRefList,
    project,
    permanentPaths
  );
  const { isPrototypeReady, currentPrototypes } = prototypeStore();
  const { data: getPrototypesQueryData } = useQuery(
    getPrototypesByProjectIdQueryOptions(project.projectId)
  );

  return (
    <div
      className={`fixed top-0 left-[250px] w-[25%] sm:w-[45%] md:w-[50%] lg:w-[calc(100%_-_500px)] bg-[#242424] border-b border-b-zinc-700 flex items-center justify-between ${isHandToolActive ? "cursor-grab" : "arkhet-cursor"}`}
    >
      <div className={`${pageContent === "Gen UI" && "hidden"}`}>
        <HoverCard openDelay={400} closeDelay={0}>
          <HoverCardTrigger>
            <button
              className={`ml-5 py-2 px-2 pl-3 rounded ${
                !isHandToolActive && "bg-zinc-600"
              }`}
              onClick={() => setIsHandToolActive(false)}
            >
              <ArrowIcon />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="p-1 w-[150px] absolute bg-zinc-950 transform border-none shadow-sm shadow-slate-800"
            side="bottom"
            sideOffset={10}
          >
            <p className="text-xs">
              Press <span className="text-sm font-bold">v</span> to activate
              arrow tool
            </p>
          </HoverCardContent>
        </HoverCard>
        <HoverCard openDelay={400} closeDelay={0}>
          <HoverCardTrigger>
            <button
              onClick={() =>
                handleAddShape({
                  type: "page",
                  canvasRef,
                  scale: view!.scale,
                  projectId: project.projectId,
                  shapeId: v4(),
                })
              }
              className="py-5 px-2"
            >
              <PageIcon />
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="p-1 w-[150px] absolute bg-zinc-950 transform border-none shadow-sm shadow-slate-800"
            side="bottom"
            sideOffset={10}
          >
            <p className="text-xs">
              Press <span className="text-sm font-bold">r</span> to add a new
              page
            </p>
          </HoverCardContent>
        </HoverCard>

        <HoverCard openDelay={400} closeDelay={0}>
          <HoverCardTrigger>
            <button
              className={`py-2 px-2 rounded ${
                isHandToolActive ? "bg-zinc-600" : ""
              }`}
            >
              <div onClick={toggleHandTool}>
                <HandToolIcon />
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="p-1 w-[220px] bg-zinc-950 transform border-none shadow-sm shadow-slate-800 absolute"
            side="bottom"
            sideOffset={10}
          >
            <p className="text-xs">
              Press <span className="text-sm font-bold">SPACE</span> or{" "}
              <span className="text-sm font-bold">h</span> to activate hand tool
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="py-7 bg-[#242424]"></div>

      <div className="ml-auto mr-auto absolute left-[40%] top-[3%] flex flex-row items-center justify-center mt-2">
        <div
          className="flex flex-col gap-1 items-center justify-center"
          onClick={() => {
            setPageContent("Interaction");
          }}
        >
          <p
            className={`text-[15px] text-center px-8 py-3 mr-2 rounded-t-sm tracking-[1px] cursor-pointer ${
              pageContent === "Interaction"
                ? "bg-[#2C2C2C]"
                : "text-white border-t border-l border-r border-[#424242] rounded-t-2xl"
            }`}
          >
            WIREFRAME
          </p>
        </div>
        <div
          className=""
          onClick={() => {
            setPageContent("Gen UI");
            view?.setScale(1);
          }}
        >
          <div
            className={`relative z-30 text-[15px] text-center px-8 py-3 ml-2 rounded-t-sm tracking-[1px] cursor-pointer ${
              pageContent === "Gen UI"
                ? "bg-[#2C2C2C]"
                : "text-white border-t border-l border-r border-[#424242] border-b-[#2C2C2C]"
            }`}
          >
            PROTOTYPE
          </div>
        </div>
      </div>
    </div>
  );
}
