import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";
import { v4 } from "uuid";

export default function DropdownComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <button
      className="hover:text-[#42A5F5] hover:bg-[#202020] rounded pt-3 transition-all ease-in-out duration-200"
      onClick={() => {
        handleAddShape({
          type: "dropdown",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "dropdown");
      }}
    >
      <div className="flex justify-center items-center">
        <svg
          width="46"
          height="17"
          viewBox="0 0 46 17"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="46" height="17" rx="3" fill="currentColor" />
          <path
            d="M35.7231 11.7071C36.1526 12.0976 36.8501 12.0976 37.2796 11.7071L41.6778 7.70871C41.9939 7.42132 42.0867 6.99336 41.9149 6.61851C41.7431 6.24365 41.3445 6 40.8978 6L32.1015 6.00312C31.6582 6.00312 31.2562 6.24678 31.0844 6.62163C30.9126 6.99649 31.0088 7.42444 31.3215 7.71183L35.7196 11.7103L35.7231 11.7071Z"
            fill="#1A1A1A"
          />
        </svg>
      </div>
      <p className="text-xs pt-5 pb-2">Dropdown</p>
    </button>
  );
}
