import { useMemo, useState, useEffect } from "react";
import ellipsis from "/iconellipsis.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { Wireframe } from "@backend/src/interfaces/artboard";

export default function DividerRightNav(props: { projectId: number }) {
  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);
  const selectedShapeId = useArtboardStore((state) => state.selectedShapeId);
  const dividerComponent = useMemo(
    () =>
      shapes &&
      (shapes.find(
        (shape) => shape.id === selectedShapeId && shape.type === "divider"
      ) as Extract<Wireframe, { type: "divider" }> | undefined),
    [shapes]
  );

  const updateDividerThickness = (thickness: number) => {
    setDividerThickness(thickness);
    if (!dividerComponent) return;
    handleUpdateShape({
      shapeId: dividerComponent.id,
      args: { type: "divider", thickness },
    });
  };

  const [dividerThickness, setDividerThickness] = useState(
    dividerComponent?.thickness || 2
  );
  const [index, setIndex] = useState(1);
  const increments = [1, 2, 3, 5, 8];

  useEffect(() => {
    if (dividerComponent?.thickness) {
      setDividerThickness(dividerComponent.thickness);
      setIndex(increments.indexOf(dividerComponent.thickness) || 1); // Sync index too
    }
  }, [dividerComponent]);

  const handleMinusClick = () => {
    if (index > 0) {
      setIndex(index - 1);
      const newThickness = increments[index - 1];
      updateDividerThickness(Math.max(1, newThickness));
    }
  };

  const handlePlusClick = () => {
    if (index < increments.length - 1) {
      setIndex(index + 1);
      const newThickness = increments[index + 1];
      updateDividerThickness(Math.min(8, newThickness));
    }
  };

  return (
    <div className="px-5 py-5 border-b border-b-[#303030]">
      <div className="flex justify-between pb-2">
        <p className="">Divider properties</p>
        <img src={ellipsis} alt="" />
      </div>

      <div className="border-b border-b-[#303030] my-2"></div>

      <div className="flex flex-col pt-2 pb-8">
        <label htmlFor="divider-thickness" className="text-md pb-8">
          Stroke size
        </label>

        <div className="flex items-center justify-center mt-2 space-x-[2px]">
          {/* Minus Button Box */}
          <button
            onClick={handleMinusClick}
            className={`text-3xl w-12 h-12 flex items-center justify-center font-bold rounded-[2px] ${dividerThickness === 1 ? "text-gray-500 bg-[#292929] cursor-not-allowed" : "bg-[#323232]"}`}
            disabled={dividerThickness === 1}
          >
            -
          </button>

          {/* Divider Preview Box */}
          <div
            className="w-24 h-12 flex items-center justify-center rounded-[2px]"
            style={{ backgroundColor: "#323232" }}
          >
            <div
              className="bg-white"
              style={{ width: "80%", height: `${dividerThickness}px` }}
            />
          </div>

          {/* Plus Button Box */}
          <button
            onClick={handlePlusClick}
            className={`text-3xl w-12 h-12 flex items-center justify-center font-bold rounded-[2px] ${dividerThickness === 8 ? "text-gray-500 bg-[#292929] cursor-not-allowed" : "bg-[#323232]"}`}
            disabled={dividerThickness === 8}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
