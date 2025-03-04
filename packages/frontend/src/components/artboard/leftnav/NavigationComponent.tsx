import { useContext } from "react";
import { v4 } from "uuid";
import { ViewContext } from "../../zoom/ViewContext";
import { ComponentProps, handleDragStart } from "./ButtonComponent";
import { useCreateShapeMutation } from "@/lib/api/shapes";

export default function NavigationComponent({
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
          type: "navigation",
          canvasRef,
          projectId,
          scale: view!.scale,
          shapeId: v4(),
        });
      }}
      draggable
      onDragStart={(e) => {
        handleDragStart(e, "navigation");
      }}
    >
      <div className="flex justify-center items-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.125 10C18.125 7.84512 17.269 5.77849 15.7452 4.25476C14.2215 2.73102 12.1549 1.875 10 1.875C7.84512 1.875 5.77849 2.73102 4.25476 4.25476C2.73102 5.77849 1.875 7.84512 1.875 10C1.875 12.1549 2.73102 14.2215 4.25476 15.7452C5.77849 17.269 7.84512 18.125 10 18.125C12.1549 18.125 14.2215 17.269 15.7452 15.7452C17.269 14.2215 18.125 12.1549 18.125 10ZM0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10ZM11.9805 12.6992L6.34375 14.8672C5.58594 15.1602 4.83984 14.4141 5.13281 13.6562L7.30078 8.01953C7.42969 7.6875 7.6875 7.42969 8.01953 7.30078L13.6562 5.13281C14.4141 4.83984 15.1602 5.58594 14.8672 6.34375L12.6992 11.9805C12.5742 12.3125 12.3125 12.5703 11.9805 12.6992ZM11.25 10C11.25 9.66848 11.1183 9.35054 10.8839 9.11612C10.6495 8.8817 10.3315 8.75 10 8.75C9.66848 8.75 9.35054 8.8817 9.11612 9.11612C8.8817 9.35054 8.75 9.66848 8.75 10C8.75 10.3315 8.8817 10.6495 9.11612 10.8839C9.35054 11.1183 9.66848 11.25 10 11.25C10.3315 11.25 10.6495 11.1183 10.8839 10.8839C11.1183 10.6495 11.25 10.3315 11.25 10Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-xs py-2">Navigation</p>
    </button>
  );
}
