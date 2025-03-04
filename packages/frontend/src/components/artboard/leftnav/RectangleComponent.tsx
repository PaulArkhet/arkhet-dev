import React, { useContext } from "react";
import { v4 } from "uuid";
import { ViewContext } from "../../zoom/ViewContext";
import { useCreateShapeMutation } from "@/lib/api/shapes";
import { ComponentProps } from "./ButtonComponent";

export const handleDragStart = (event: React.DragEvent, type: string) => {
  event.dataTransfer.setData("application/json", JSON.stringify({ type }));
};

export default function TextComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <div
      className="justify-center items-center flex hover:text-[#42A5F5] hover:bg-[#202020] rounded pt-5 transition-all ease-in-out duration-200 cursor-pointer"
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "rectangle");
      }}
      onClick={() => {
        handleAddShape({
          type: "rectangle",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
    >
      <button>
        <svg
          width="46"
          height="17"
          viewBox="0 0 46 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="46" height="17" rx="3" fill="currentColor" />
        </svg>
        <p className="text-xs pt-5 pb-2">Card</p>
      </button>
    </div>
  );
}
