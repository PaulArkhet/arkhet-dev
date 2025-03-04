import { useContext } from "react";
import { v4 } from "uuid";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";

export default function CheckboxComponent({
  canvasRef,
  projectId,
}: ComponentProps) {
  const { mutate: handleAddShape } = useCreateShapeMutation(projectId);
  const view = useContext(ViewContext);

  return (
    <button
      className="hover:text-[#42A5F5] hover:bg-[#202020] rounded pt-4 transition-all ease-in-out duration-200"
      onClick={() => {
        handleAddShape({
          type: "checkbox",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "checkbox");
      }}
    >
      <div className="flex justify-center items-center">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.71429 0C0.76875 0 0 0.76875 0 1.71429V10.2857C0 11.2312 0.76875 12 1.71429 12H10.2857C11.2312 12 12 11.2312 12 10.2857V1.71429C12 0.76875 11.2312 0 10.2857 0H1.71429ZM9.02679 4.74107L5.59821 8.16964C5.34643 8.42143 4.93929 8.42143 4.69018 8.16964L2.97589 6.45536C2.72411 6.20357 2.72411 5.79643 2.97589 5.54732C3.22768 5.29821 3.63482 5.29554 3.88393 5.54732L5.14286 6.80625L8.11607 3.83036C8.36786 3.57857 8.775 3.57857 9.02411 3.83036C9.27321 4.08214 9.27589 4.48929 9.02411 4.73839L9.02679 4.74107Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-xs pt-5 ">Checkbox</p>
    </button>
  );
}
