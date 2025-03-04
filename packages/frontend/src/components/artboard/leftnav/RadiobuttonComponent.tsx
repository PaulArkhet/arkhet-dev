import { useContext } from "react";
import { ViewContext } from "../../zoom/ViewContext";
import { v4 } from "uuid";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";

export default function RadiobuttonComponent({
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
          type: "radio",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "radio");
      }}
    >
      <div className="flex justify-center items-center">
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.2188 9.5C17.2188 7.45286 16.4055 5.48957 14.958 4.04202C13.5104 2.59447 11.5471 1.78125 9.5 1.78125C7.45286 1.78125 5.48957 2.59447 4.04202 4.04202C2.59447 5.48957 1.78125 7.45286 1.78125 9.5C1.78125 11.5471 2.59447 13.5104 4.04202 14.958C5.48957 16.4055 7.45286 17.2188 9.5 17.2188C11.5471 17.2188 13.5104 16.4055 14.958 14.958C16.4055 13.5104 17.2188 11.5471 17.2188 9.5ZM0 9.5C0 6.98044 1.00089 4.56408 2.78249 2.78249C4.56408 1.00089 6.98044 0 9.5 0C12.0196 0 14.4359 1.00089 16.2175 2.78249C17.9991 4.56408 19 6.98044 19 9.5C19 12.0196 17.9991 14.4359 16.2175 16.2175C14.4359 17.9991 12.0196 19 9.5 19C6.98044 19 4.56408 17.9991 2.78249 16.2175C1.00089 14.4359 0 12.0196 0 9.5ZM9.5 5.9375C10.4448 5.9375 11.351 6.31283 12.0191 6.98093C12.6872 7.64903 13.0625 8.55517 13.0625 9.5C13.0625 10.4448 12.6872 11.351 12.0191 12.0191C11.351 12.6872 10.4448 13.0625 9.5 13.0625C8.55517 13.0625 7.64903 12.6872 6.98093 12.0191C6.31283 11.351 5.9375 10.4448 5.9375 9.5C5.9375 8.55517 6.31283 7.64903 6.98093 6.98093C7.64903 6.31283 8.55517 5.9375 9.5 5.9375Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-xs pt-2 pb-2">Radio Button</p>
    </button>
  );
}
