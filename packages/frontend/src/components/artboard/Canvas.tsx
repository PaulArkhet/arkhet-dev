import { MutableRefObject, useContext, useState } from "react";
import useArtboardStore from "../../store/ArtboardStore";
import { Wireframe, PermanentPath } from "@backend/src/interfaces/artboard";
import { v4 as uuid } from "uuid";
import { ViewContext } from "../zoom/ViewContext";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import { DragAndDropComponent } from "./components/DragAndDropComponent";
import { DragAndDropIframe } from "./components/DragAndDropIframe";
import { GlobalPathSegments } from "./components/GlobalPathSegments";
import { findOrthogonalPath } from "@/lib/orthogonal-finder";
import { getMultipageHandlePoint } from "./components/MultipageHandles";
import { useQuery } from "@tanstack/react-query";
import { getMultipagePathsQueryOptions } from "@/lib/api/multipage-paths";
import { Project } from "@backend/db/schemas/projects";
import { PageNavigation } from "@/routes/_authenticated/artboard/$projectId";

export const GRID_SIZE_PIXELS = 5;

function setupInstances(shapesParam: Wireframe[]) {
  const newShapes: Wireframe[] = [...shapesParam];
  const newChildren: Wireframe[] = [];
  const result = newShapes.map((shape) => {
    if (shape.type !== "instance") return shape;
    const parent = newShapes.find((newShape) => newShape.id === shape.parentId);
    if (!parent) return shape;
    if (parent.type !== "card") {
      throw new Error("ERR: parent is not of type card");
    }
    const newInstance = { ...shape };
    newInstance.width = parent.width;
    newInstance.height = parent.height;
    parent.childrenComponents.map((childId: string) => {
      const newChild = {
        ...newShapes.find((newShape) => newShape.id === childId)!,
        isInstanceChild: true,
      }; // perhaps should be childOfInstance of type number to handle deletion
      const childToParentX =
        newShapes.find((newShape) => newShape.id === childId)!.xOffset -
        parent.xOffset;
      const childToParentY =
        newShapes.find((newShape) => newShape.id === childId)!.yOffset -
        parent.yOffset;
      newChild.xOffset = newInstance.xOffset + childToParentX;
      newChild.yOffset = newInstance.yOffset + childToParentY;
      newChildren.push(newChild);
    });
    return newInstance;
  });
  return [...result, ...newChildren];
}

export function Canvas({
  shapes,
  pageRefList,
  allShapesRefList,
  canvasRef,
  isHandToolActive,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleCanvasClick,
  code,
  socket,
  project,
  handleContextMenu,
  pageContent,
}: {
  code?: string;
  socket?: Socket;
  shapes: Wireframe[] | undefined;
  canvasPosition: { x: number; y: number };
  pageRefList: MutableRefObject<HTMLDivElement[]>;
  allShapesRefList: MutableRefObject<HTMLDivElement[]>;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
  isHandToolActive: boolean;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleCanvasClick: (event: React.MouseEvent) => void;
  project: Project;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  pageContent: PageNavigation;
}) {
  const viewContext = useContext(ViewContext);
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const { data: permanentPaths } = useQuery(
    getMultipagePathsQueryOptions({ projectId: project.projectId })
  );

  const { debugPath, setSelectedShapeId } = useArtboardStore();

  function handleMouseMoveGrid(e: React.MouseEvent<HTMLDivElement>) {
    if (!canvasRef.current || !viewContext) return;
    const { left, top, width, height } =
      canvasRef.current.getBoundingClientRect();
    const { scale } = viewContext;
    // Track the cursor position so we can center the radial gradient
    setMousePos({
      x: (e.clientX - left + width / 5) / scale,
      y: (e.clientY - top + height / 5) / scale,
    });
  }

  function getPermanentPath(path: PermanentPath) {
    if (!shapes) throw new Error("No shapes...");
    const shapeStart = shapes.find((shape) => shape.id === path.shapeStartId);
    const shapeEnd = shapes.find((shape) => shape.id === path.shapeEndId);
    if (!shapeStart || !shapeEnd) return null;

    const firstPoint = getMultipageHandlePoint({
      handle: path.shapeStartHandleType,
      ...shapeStart,
    });

    const lastPoint = getMultipageHandlePoint({
      handle: path.shapeEndHandleType,
      ...shapeEnd,
    });

    const pathWithExcludes = findOrthogonalPath(
      { x: firstPoint.xStart, y: firstPoint.yStart },
      { x: lastPoint.xStart, y: lastPoint.yStart },
      path.pageExcludeList
        .map((shapeId) =>
          shapes.find((shape) => shape.id.toString() === shapeId)
        )
        .filter((shapeOrUndefined) => shapeOrUndefined !== undefined),
      path.direction
    );
    if (pathWithExcludes.length === 0) {
      return findOrthogonalPath(
        { x: firstPoint.xStart, y: firstPoint.yStart },
        { x: lastPoint.xStart, y: lastPoint.yStart },
        [],
        path.direction
      );
    }
    return pathWithExcludes;
  }

  return (
    <div
      id="canvas"
      className={`w-[5000px] h-[5000px] absolute bg-[#2c2c2c] border rounded -top-[1000px] -left-[1000px] z-0 ${pageContent === "Gen UI" && "overflow-hidden"} ${isHandToolActive ? "cursor-grab" : "arkhet-cursor"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={(args) => {
        handleMouseMove(args);
        handleMouseMoveGrid(args);
      }}
      onMouseUp={handleCanvasClick}
      ref={canvasRef}
    >
      <div
        className={twMerge(
          "w-[5000px] h-[5000px] absolute bg-[#2c2c2c] border rounded -top-[1000px] -left-[1000px] z-0 transition-opacity duration-500",
          viewContext && viewContext.scale >= 2 ? "opacity-1" : "opacity-0"
        )}
        style={{
          backgroundImage:
            "linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)",
          backgroundSize: `${GRID_SIZE_PIXELS}px ${GRID_SIZE_PIXELS}px`,
        }}
      >
        <div
          className="top-0 left-0 w-[5000px] h-[5000px] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_transparent,_#2c2c2c)]"
          style={{
            background: `radial-gradient(
            circle at ${mousePos.x}px ${mousePos.y}px,
            rgba(44,44,44,0) 0%,
            rgba(44,44,44,0) 1%,
            rgba(44,44,44,0.8) 3%,
            rgba(44,44,44,1) 4%
          )`,
          }}
        />
      </div>
      <div className="relative w-full h-full">
        {debugPath && <GlobalPathSegments debugPath={debugPath.path} />}
        {permanentPaths &&
          shapes &&
          permanentPaths
            .filter((path) => path.projectId === project.projectId)
            .map((path) => {
              const calculatedPath = getPermanentPath(path);
              if (!calculatedPath) return null;
              return (
                <GlobalPathSegments debugPath={calculatedPath} key={path.id} />
              );
            })}
        {code && (
          <div className="relative top-20 left-4">
            <DragAndDropIframe
              code={code}
              socket={socket}
              handleMouseUp={handleMouseUp}
              canvasRef={canvasRef}
              isHandToolActive={isHandToolActive}
              projectId={project.projectId}
            />
          </div>
        )}
        {canvasRef.current && (
          <div
            style={{
              left: `${mousePos.x - 1003}px`,
              top: `${mousePos.y - 1003}px`,
            }}
            className="mouse-follow absolute w-1 h-1 bg-transparent"
          />
        )}
        {shapes &&
          setupInstances(shapes).map((shape) => (
            <div
              key={shape.id}
              onContextMenu={(e) => {
                handleContextMenu(e);
                setSelectedShapeId(shape.id);
              }}
            >
              <DragAndDropComponent
                mousePos={mousePos}
                projectId={project.projectId}
                shapes={shapes}
                handleMouseUp={handleMouseUp}
                canvasRef={canvasRef}
                shape={shape}
                pageRefList={pageRefList}
                allShapesRefList={allShapesRefList}
                isHandToolActive={isHandToolActive}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
