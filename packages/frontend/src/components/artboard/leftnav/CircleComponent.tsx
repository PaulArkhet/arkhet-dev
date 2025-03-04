import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { v4 } from "uuid";
import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";

export default function CircleComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <div
      className="justify-center items-center flex hover:text-[#42A5F5] hover:bg-[#202020] rounded pt-5 transition-all ease-in-out duration-200"
      onClick={() => {
        handleAddShape({
          type: "circle",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "circle");
      }}
    >
      <HoverCard openDelay={400} closeDelay={0}>
        <HoverCardTrigger>
          <button>
            <div className="h-[20px] w-[20px] bg-white rounded-full mx-auto" />
            <p className="text-xs pt-5 pb-4">Circle</p>
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          className="p-1 w-fit bg-zinc-950 transform border-none shadow-sm shadow-slate-800"
          sideOffset={-40}
        >
          <p className="text-xs">
            Press <span className="text-sm font-bold">c</span> to add a circle
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
