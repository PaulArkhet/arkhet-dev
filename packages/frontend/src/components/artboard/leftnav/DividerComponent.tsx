import useArtboardStore from "../../../store/ArtboardStore";
import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";
import { v4 } from "uuid";

export default function DividerComponentt({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <button
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
      <div className="flex justify-center items-center">
        <svg
          width="32"
          height="3"
          viewBox="0 0 32 3"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 1.5H30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-xs pt-5 pb-2">Divider</p>
    </button>
  );
}
