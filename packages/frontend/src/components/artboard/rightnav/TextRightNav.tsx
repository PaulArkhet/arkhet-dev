import { useMemo, useState } from "react";
import ellipsis from "/iconellipsis.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { Wireframe } from "@backend/src/interfaces/artboard";

export default function TextRightNav(props: { projectId: number }) {
  const [showFontColors, setShowFontColors] = useState(false);
  const [fontColor, setFontColor] = useState("White");
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);
  const selectedShapeId = useArtboardStore((state) => state.selectedShapeId);
  const textComponent = useMemo(
    () =>
      shapes &&
      (shapes.find(
        (shape) => shape.id === selectedShapeId && shape.type === "text"
      ) as Extract<Wireframe, { type: "text" }> | undefined),
    [shapes]
  );

  function toggleShowFontColors() {
    setShowFontColors(!showFontColors);
    setShowFontSizes(false);
    setShowIcons(false);
  }

  function toggleShowFontSizes() {
    setShowFontSizes(!showFontSizes);
    setShowFontColors(false);
    setShowIcons(false);
  }

  function updateTextColor(color: string) {
    if (!textComponent) return;
    handleUpdateShape({
      shapeId: textComponent.id,
      args: { type: "text", fontColor: color },
    });
  }

  function updateTextSize(size: string) {
    console.log(textComponent);
    if (!textComponent) return;
    handleUpdateShape({
      shapeId: textComponent.id,
      args: { type: "text", fontSize: size },
    });
  }

  return (
    <div>
      <div className="px-5 py-5 border-b border-b-[#303030]">
        <div className="flex justify-between pb-2">
          <p className="">Text</p>
          <img src={ellipsis} alt="" />
        </div>
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowFontSizes}
        >
          <div className="bg-zinc-600 mt-2 mr-2 h-[5px] w-[18px]"></div>
          <p>
            {textComponent &&
              (textComponent.fontSize === "text-xs"
                ? "Small"
                : textComponent.fontSize === "text-sm"
                  ? "Medium"
                  : "Large")}{" "}
            Font
          </p>
        </div>
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowFontColors}
        >
          <div className="bg-zinc-600 mt-2 mr-2 h-[5px] w-[18px]"></div>
          <p>{fontColor} Color</p>
        </div>
      </div>
      {showFontColors && (
        <div className="fixed top-[130px] right-[260px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer">
          <div
            className={`py-2 ${
              fontColor == "White" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setFontColor("White");
              setShowFontColors(false);
              updateTextColor("text-white");
            }}
          >
            White
          </div>
          <div
            className={`py-2 ${
              fontColor == "Black" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setFontColor("Black");
              setShowFontColors(false);
              updateTextColor("text-black");
            }}
          >
            Black
          </div>
        </div>
      )}
      {showFontSizes && textComponent && (
        <div className="fixed top-[90px] right-[260px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer">
          <div
            className={`py-2 ${
              textComponent.fontSize === "text-xl" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setShowFontSizes(false);
              updateTextSize("text-xl");
            }}
          >
            Large
          </div>
          <div
            className={`py-2 ${
              textComponent.fontSize === "text-sm" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setShowFontSizes(false);
              updateTextSize("text-sm");
            }}
          >
            Medium
          </div>
          <div
            className={`py-2 ${
              textComponent.fontSize === "text-xd" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setShowFontSizes(false);
              updateTextSize("text-xs");
            }}
          >
            Small
          </div>
        </div>
      )}
    </div>
  );
}
