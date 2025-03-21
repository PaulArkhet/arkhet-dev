import useArtboardStore from "../../../store/ArtboardStore";
import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";
import { v4 } from "uuid";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

export default function DividerComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <div
      className="hover:text-[#42A5F5] hover:bg-[#202020] rounded pt-6 transition-all ease-in-out duration-200"
      onClick={() => {
        handleAddShape({
          type: "divider",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "divider");
      }}
    >
      <HoverCard openDelay={400} closeDelay={0}>
        <HoverCardTrigger>
          <div className="flex flex-col p-1">
            <svg
              width="32"
              height="3"
              viewBox="0 0 32 3"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <path
                d="M2 1.5H30"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-xs pt-5 pb-2 text-center">
            <span className="font-bold">D</span>ivider
          </p>
        </HoverCardTrigger>
        <HoverCardContent
          className="p-1 w-fit bg-zinc-950 transform border-none shadow-sm shadow-slate-800"
          sideOffset={-40}
        >
          <p className="text-xs">
            Press <span className="text-sm font-extrabold">d</span> to add a
            divider
          </p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
