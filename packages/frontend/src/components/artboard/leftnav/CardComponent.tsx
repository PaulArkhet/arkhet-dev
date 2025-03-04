import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";
import { v4 } from "uuid";
export default function CardComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <button
      className="hover:text-[#42A5F5] hover:bg-[#202020] rounded transition-all ease-in-out duration-200"
      onClick={() =>
        handleAddShape({
          type: "card",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        })
      }
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "card");
      }}
    >
      <p className="p-3 ">+ Create New</p>
    </button>
  );
}

CardComponent;
