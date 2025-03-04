import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState, useRef, useContext, useMemo } from "react";
import LeftNav from "../../../components/artboard/LeftNav";
import useArtboardStore from "../../../store/ArtboardStore";
import { type Wireframe } from "@backend/src/interfaces/artboard";
import RightNav from "../../../components/artboard/RightNav";
import TopNav, {
  useTriggerGeneration,
} from "../../../components/artboard/TopNav";
import { Canvas } from "@/components/artboard/Canvas";
import { DragAndDropComponent } from "../../../components/artboard/components/DragAndDropComponent";
import { ViewContext } from "../../../components/zoom/ViewContext";
import ZoomableComponent from "../../../components/zoom/ZoomableComponent";
import { v4 } from "uuid";
import { twMerge } from "tailwind-merge";
import { useGenerationStore } from "../../../store/GenerationStore";
import {
  getProjectByIdQueryOptions,
  useUpdateProjectMutation,
} from "@/lib/api/projects";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  getMultipagePathsQueryOptions,
  useDeleteMultipagePathMutation,
} from "@/lib/api/multipage-paths";
import { getPrototypesByProjectIdQueryOptions } from "@/lib/api/prototypes";
import prototypeStore from "@/store/PrototypeStore";
import {
  getAllShapesForProjectQueryOptions,
  useCreateShapeMutation,
  useDeleteShapeMutation,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { ZoomBadge } from "@/components/zoom/ZoomBadge";
import { AINotifications } from "@/components/artboard/components/AINotifications";
import MagicMoment from "@/components/artboard/components/MagicMoment";
import noproto from "/noproto.png";
import { handleUpdateTitle } from "@/components/dashboard/Project";

export const Route = createFileRoute("/_authenticated/artboard/$projectId")({
  beforeLoad: async ({ context, params }) => {
    const { projectId: projectIdParam } = params;
    try {
      // this can throw...
      const projectId = z.coerce.number().int().parse(projectIdParam);

      // this can throw...
      const project = await context.queryClient.fetchQuery({
        ...getProjectByIdQueryOptions(projectId),
        retry: 4, // exponential backoff 4 retries
      });

      return { project };
    } catch (e) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Artboard,
});

export type Bounds = ReturnType<typeof getBoundsForShape>;
export type PageNavigation = "Interaction" | "Gen UI";

export function getBoundsForShape(shape: Wireframe) {
  return {
    leftBound: shape.xOffset,
    rightBound: shape.xOffset + shape.width,
    topBound: shape.yOffset,
    bottomBound: shape.yOffset + shape.height,
  };
}

export function isInBoundsOfOuterShape(outerShape: Bounds, innerShape: Bounds) {
  const result =
    outerShape.topBound < innerShape.topBound &&
    outerShape.bottomBound > innerShape.bottomBound &&
    outerShape.leftBound < innerShape.leftBound &&
    outerShape.rightBound > innerShape.rightBound;
  return result;
}

export function isShapeInPage(shape: Wireframe, page: Wireframe) {
  return isInBoundsOfOuterShape(
    getBoundsForShape(page),
    getBoundsForShape(shape)
  );
}

function setupArtboardTree(shapes: Wireframe[]) {
  // react screenshot needs all components inside of each "frame" to be
  // children of each other to include them in the screenshot
  const roots = shapes.filter((shape) => shape.type === "page");
  const children = shapes.filter((shape) => shape.type !== "page");

  const newRoots = roots.map((root: Wireframe & { children?: Wireframe[] }) => {
    const newRoot = { ...root };
    newRoot.children = [];
    const rootBounds = getBoundsForShape(root);
    const innerChildren = children.filter((child) => {
      const childBounds = getBoundsForShape(child);
      return isInBoundsOfOuterShape(rootBounds, childBounds);
    });
    innerChildren.forEach((child) => {
      const index = children.findIndex(
        (selectedChild) => selectedChild.id === child.id
      );
      children.splice(index, 1);
      const newChild = { ...child };
      newChild.xOffset -= root.xOffset;
      newChild.yOffset -= root.yOffset;
      newRoot.children!.push(newChild);
    });
    return newRoot;
  });
  const result = [
    ...newRoots,
    ...(children as (Wireframe & { children: undefined })[]),
  ];
  return result;
}

function moveLayer(
  objects: Wireframe[],
  targetId: string,
  direction: "up" | "down"
): Wireframe[] {
  // Sort the objects by zIndex in ascending order.
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  // Find the index of the target object.
  const targetIndex = sortedObjects.findIndex((obj) => obj.id === targetId);
  if (targetIndex === -1) {
    return objects;
  }

  // Determine the new index based on the direction.
  const newIndex = direction === "up" ? targetIndex + 1 : targetIndex - 1;
  if (newIndex < 0 || newIndex >= sortedObjects.length) {
    return objects;
  }

  // Remove the target object from its current position.
  const [targetObj] = sortedObjects.splice(targetIndex, 1);
  // Insert the target object at the new position.
  sortedObjects.splice(newIndex, 0, targetObj);

  // Reassign zIndex values so that they reflect the new ordering.
  const updatedObjects = sortedObjects.map((obj, idx) => ({
    ...obj,
    zIndex: idx,
  }));

  return updatedObjects;
}

export function Artboard() {
  const {
    selectedShapeId,
    setSelectedShapeId,
    setDebugPath,
    isHandToolActive,
    toggleHandTool,
    setIsHandToolActive,
    handleTimeTravel,
  } = useArtboardStore((state) => state);
  const { code, socket } = useGenerationStore((state) => state);
  const { project } = Route.useRouteContext();
  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(project.projectId)
  );
  const { mutate: deletePermanentPath } = useDeleteMultipagePathMutation();
  const { mutate: handleAddShape } = useCreateShapeMutation(project.projectId);
  const { mutate: handleDeleteShape } = useDeleteShapeMutation(
    project.projectId
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(
    project.projectId
  );
  const { data: permanentPaths } = useQuery(
    getMultipagePathsQueryOptions({ projectId: project.projectId })
  );
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const selectedShape = useMemo(
    () => shapes && shapes.find((shape) => shape.id === selectedShapeId),
    [selectedShapeId, shapes]
  );

  const [canvasPosition, setCanvasPosition] = useState({
    x: -1000,
    y: -1000,
  });
  const pageRefList = useRef<HTMLDivElement[]>([]);
  const allShapesRefList = useRef<HTMLDivElement[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const view = useContext(ViewContext);

  // Changing the page content: Gen UI
  const [pageContent, setPageContent] = useState<PageNavigation>("Interaction");
  const [warningMode, setWarningMode] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
    setCurrentPrototype,
    isPrototypeReady,
    setIsPrototypeReady,
    setCurrentPrototypes,
  } = prototypeStore();

  const { data: prototypesQuery } = useQuery(
    getPrototypesByProjectIdQueryOptions(project.projectId)
  );

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
  }

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setContextMenu(null);
    }
  }

  useEffect(() => {
    if (prototypesQuery !== undefined && prototypesQuery.length > 0) {
      setCurrentPrototype(prototypesQuery[0]);
      setCurrentPrototypes(prototypesQuery);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !shapes) return;
    if (shapes && shapes.length == 0) {
      handleAddShape({
        type: "page",
        canvasRef,
        scale: view!.scale,
        projectId: project.projectId,
        shapeId: v4(),
      });
      hasRun.current = true;
    }
  }, [shapes]);

  function handleMouseDown(event: React.MouseEvent) {
    if (isHandToolActive || event.button === 1) {
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  }

  function handleMouseMove(event: React.MouseEvent) {
    if (isHandToolActive && dragStart) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      setCanvasPosition((prevPosition) => ({
        x: prevPosition.x + dx / 2,
        y: prevPosition.y + dy / 2,
      }));
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  }

  function handleMouseUp() {
    setDragStart(null);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedShapeId !== null
      ) {
        if (!shapes) return;
        console.log(shapes, selectedShapeId);
        const currentShape = shapes.find(
          (shape) => shape.id === selectedShapeId
        );

        if (!currentShape) {
          return console.error(
            "Deleting shape but no selectedShapeId found, returning..."
          );
        }

        if (currentShape.type !== "card") {
          // find all permanent paths
          if (permanentPaths) {
            permanentPaths.forEach((path) =>
              deletePermanentPath({
                projectId: project.projectId,
                multipageId: path.id,
              })
            );
          }
          return handleDeleteShape(selectedShapeId);
        }

        if (currentShape.hasInstances) {
          return setWarningMode(true);
        } else {
          if (permanentPaths) {
            permanentPaths.forEach((path) =>
              deletePermanentPath({
                projectId: project.projectId,
                multipageId: path.id,
              })
            );
          }
          return handleDeleteShape(selectedShapeId);
        }
      }

      if (event.ctrlKey && event.key === "z") {
        handleTimeTravel("undo");
      }

      if (event.ctrlKey && event.key === "y") {
        handleTimeTravel("redo");
      }

      //implement ctrl c + ctrl v

      /*
            if (event.ctrlKey && event.key === "=") {
                event.preventDefault();
                setScale((prevScale) => Math.min(prevScale + 0.1, 3)); // Limit maximum zoom to 3
                console.log(scale);
            } else if (event.ctrlKey && event.key === "-") {
                event.preventDefault();
                setScale((prevScale) => Math.max(prevScale - 0.1, 0.1)); // Limit minimum zoom to 0.5
                console.log(scale);
            }
            */

      if (event.key === "h") {
        toggleHandTool();
      }
      if (event.key === "v") {
        setIsHandToolActive(false);
      }
      if (event.key === "r" && !event.ctrlKey) {
        handleAddShape({
          type: "page",
          canvasRef,
          scale: view!.scale,
          projectId: project.projectId,
          shapeId: v4(),
        });
      }
      if (event.key === "t" && !event.ctrlKey) {
        handleAddShape({
          type: "text",
          canvasRef,
          scale: view!.scale,
          projectId: project.projectId,
          shapeId: v4(),
        });
      }
      if (event.key === "b" && !event.ctrlKey) {
        handleAddShape({
          type: "button",
          canvasRef,
          scale: view!.scale,
          projectId: project.projectId,
          shapeId: v4(),
        });
      }
      if (event.key === "c" && !event.ctrlKey) {
        handleAddShape({
          type: "circle",
          canvasRef,
          scale: view!.scale,
          projectId: project.projectId,
          shapeId: v4(),
        });
      }
      if (event.key === "i" && !event.ctrlKey) {
        handleAddShape({
          type: "inputField",
          canvasRef,
          scale: view!.scale,
          projectId: project.projectId,
          shapeId: v4(),
        });
      }
      if (event.key === " ") {
        event.preventDefault();
        setIsHandToolActive(true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === " ") {
        // Deactivate hand tool on spacebar release
        setIsHandToolActive(false);
      }
    }

    function handleWheel(event: WheelEvent) {
      if (pageContent === "Gen UI" || event.ctrlKey) {
        event.preventDefault();
      }
    }

    function handleMouseDown(event: MouseEvent) {
      if (event.button === 1) {
        // Middle mouse button (scroll wheel click)
        event.preventDefault();
        setIsHandToolActive(true); // Activate hand tool on scroll wheel press
      }
    }

    // function handleMouseUp(event: MouseEvent) {  // Vitor: not sure why this was unused
    //   if (event.button === 1) {
    //     // Deactivate hand tool on scroll wheel release
    //     setIsHandToolActive(false);
    //   }
    // }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    // window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      // window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectedShapeId, view, pageContent]);

  function handleCanvasClick(event: React.MouseEvent) {
    const currentTarget = event.currentTarget as HTMLElement;
    // console.log(event.target, event.currentTarget);

    // Deselect any selected shape when clicking on the canvas
    const isMultipageHandle =
      event.target instanceof HTMLElement &&
      event.target.classList.contains("multipage-handle");
    const isShape = !(
      event.target instanceof HTMLElement &&
      event.target.classList.contains("mouse-follow")
    ); // hacky way to detect a canvas click;
    if (isMultipageHandle || isShape) {
      return;
    }
    console.log("detected a canvas click!", event.currentTarget, event.target);
    setSelectedShapeId(null);
    setDebugPath(null);
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const data = event.dataTransfer.getData("application/json");
    const parsedData = JSON.parse(data);

    const rect = canvasRef.current?.getBoundingClientRect();
    const x = (event.clientX - (rect?.left || 0)) / view!.scale;
    const y = (event.clientY - (rect?.top || 0)) / view!.scale;

    console.log("Dropped data:", parsedData);
    console.log("Drop position:", x, y);

    handleAddShape({
      type: parsedData.type,
      canvasRef,
      scale: view!.scale,
      projectId: project.projectId,
      shapeId: v4(),
    });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const [projectTitle, setProjectTitle] = useState(project.title);
  const { mutate: updateProject, isPending: mutateProjectPending } =
    useUpdateProjectMutation();
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { triggerGeneration } = useTriggerGeneration(
    { ref: pageRefList },
    project,
    permanentPaths,
    true
  );

  return (
    <main
      className={`bg-[#2c2c2c] text-white h-screen w-screen overflow-hidden`}
      style={{ cursor: isHandToolActive ? "grab" : "arkhet-cursor" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {pageContent === "Interaction" && <ZoomBadge />}
      {/* {socket && <AINotifications socket={socket} />} */}
      {isPrototypeReady && (
        <div className="absolute top-[4.5rem] left-[16.5rem] z-[999] bg-[#373737] px-5 py-3 shadow-[3px_3px_5px_0px_rgba(0,0,0,0.25)]">
          <form
            onSubmit={(e) =>
              handleUpdateTitle(
                e,
                mutateProjectPending,
                updateProject,
                projectTitle,
                project.projectId,
                setEditMode,
                setShowMenu
              )
            }
            className="flex flex-col"
          >
            <input
              name="title"
              id="title"
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
            {editMode && <button className="hidden pr-2">Update</button>}
          </form>
        </div>
      )}
      {warningMode && (
        <div
          className="fixed z-[201] py-5 px-2 md:px-5 rounded-lg bg-[#1A1A1A] top-[10%] md:left-[35%] flex flex-col"
          onClick={() => setWarningMode(false)}
        >
          <div className="text-xl py-5 font-bold">Warning</div>
          <div className="">
            Cannot delete a custom component with existing instances
          </div>
          <div className="mx-auto py-2">
            <div className="flex pl-64">
              <button
                className="hidden md:block md:pb-1 edit-btn cursor-pointer px-5 py-2 md:my-2 mx-2 bg-[#BABABA] rounded hover:bg-[#fafafa] transition-all ease duration-300 text-black tracking-widest"
                onClick={() => setWarningMode(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {warningMode && (
        <div
          className="fixed inset-0 bg-black z-[200] opacity-70"
          onClick={() => setWarningMode(false)}
        ></div>
      )}
      {pageContent === "Gen UI" && !isPrototypeReady ? (
        <>
          {socket && <MagicMoment socket={socket} />}
          <div className="absolute left-[10000000px]">
            <Canvas
              shapes={[]}
              pageRefList={{ current: [] }}
              allShapesRefList={{ current: [] }}
              canvasRef={canvasRef}
              // scale={scale}
              canvasPosition={{ x: -1000, y: -1000 }}
              isHandToolActive={isHandToolActive}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              handleCanvasClick={handleCanvasClick}
              code={code}
              socket={socket ? socket : undefined}
              project={project}
              handleContextMenu={handleContextMenu}
              pageContent={pageContent}
            />
          </div>
        </>
      ) : pageContent === "Gen UI" &&
        prototypesQuery !== undefined &&
        prototypesQuery.length === 0 ? (
        <div className="pl-[100px] pt-[200px] flex flex-col">
          <img src={noproto} className="mx-auto" />
          {shapes !== undefined && shapes.length > 1 ? (
            <p className="text-center my-2 text-[#959595]">
              Generate your prototype to see your wireframe come to life{" "}
            </p>
          ) : (
            <p className="text-center my-2 text-[#959595]">
              Start building a wireframe to create your first prototype{" "}
            </p>
          )}
          {shapes !== undefined && shapes.length > 1 ? (
            <button
              className="bg-[#9253E4] py-3 px-5 mx-auto my-2"
              onClick={() => triggerGeneration()}
            >
              GENERATE
            </button>
          ) : (
            <button
              className="bg-[#9253E4] py-3 px-5 mx-auto my-2"
              onClick={() => setPageContent("Interaction")}
            >
              BUILD NOW
            </button>
          )}
        </div>
      ) : (
        pageContent === "Gen UI" && (
          <div className="overflow-hidden">
            <Canvas
              shapes={[]}
              pageRefList={{ current: [] }}
              allShapesRefList={{ current: [] }}
              canvasRef={canvasRef}
              // scale={scale}
              canvasPosition={{ x: -1000, y: -1000 }}
              isHandToolActive={isHandToolActive}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              handleCanvasClick={handleCanvasClick}
              code={code}
              socket={socket ? socket : undefined}
              project={project}
              handleContextMenu={handleContextMenu}
              pageContent={pageContent}
            />
          </div>
        )
      )}

      {pageContent === "Interaction" && (
        <ZoomableComponent panning={isHandToolActive}>
          <Canvas
            shapes={shapes}
            pageRefList={{ current: [] }}
            allShapesRefList={allShapesRefList}
            canvasRef={canvasRef}
            // scale={scale}
            canvasPosition={canvasPosition}
            isHandToolActive={isHandToolActive}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleCanvasClick={handleCanvasClick}
            project={project}
            handleContextMenu={handleContextMenu}
            pageContent={pageContent}
          />
        </ZoomableComponent>
      )}

      <div className="z-[-10] absolute overflow-hidden">
        {shapes &&
          setupArtboardTree(shapes).map((shape) => (
            <DragAndDropComponent
              projectId={project.projectId}
              mousePos={{ x: 0, y: 0 }}
              key={shape.id}
              shape={shape}
              pageRefList={pageRefList}
              canvasRef={canvasRef}
              allShapesRefList={allShapesRefList}
              isHandToolActive={isHandToolActive}
              handleMouseUp={() => null}
              shapes={shapes}
            />
          ))}
      </div>
      {contextMenu?.visible && (
        <div
          ref={menuRef}
          className="absolute bg-[#1A1A1A] p-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block px-4 py-2 hover:bg-[#373737] w-full text-left"
            onClick={() => {
              if (!selectedShape || !shapes || !selectedShapeId) return;
              const newShapes = moveLayer(shapes, selectedShapeId, "down");

              newShapes.forEach((shape) => {
                handleUpdateShape({
                  shapeId: shape.id,
                  args: {
                    zIndex: shape.zIndex,
                    type: shape.type,
                  },
                });
              });
              setContextMenu(null);
            }}
          >
            Move to Back
          </button>
          <button
            className="block px-4 py-2 hover:bg-[#373737] w-full text-left"
            onClick={() => {
              if (!selectedShape || !shapes || !selectedShapeId) return;
              const newShapes = moveLayer(shapes, selectedShapeId, "up");

              newShapes.forEach((shape) => {
                handleUpdateShape({
                  shapeId: shape.id,
                  args: {
                    zIndex: shape.zIndex,
                    type: shape.type,
                  },
                });
              });
              setContextMenu(null);
            }}
          >
            Move to Front
          </button>
        </div>
      )}
      <TopNav
        pageRefList={{ ref: pageRefList }} // not correct
        pageContent={pageContent}
        setPageContent={setPageContent}
        canvasRef={canvasRef}
      />
      <LeftNav
        pageContent={pageContent}
        canvasRef={canvasRef}
        project={project}
      />
      <RightNav
        pageContent={pageContent}
        setPageContent={setPageContent}
        pageRefList={{ ref: pageRefList }}
        canvasRef={canvasRef}
      />
    </main>
  );
}
