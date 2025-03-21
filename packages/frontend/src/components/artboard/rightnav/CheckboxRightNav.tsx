import { useState } from "react";
import ellipsis from "/iconellipsis.svg";
import toggleOff from "/icontoggleoff.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { Wireframe } from "@backend/src/interfaces/artboard";
import { v4 as uuid } from "uuid";

export default function CheckboxRightNav(props: { projectId: number }) {
  const [checkboxLayout, setCheckboxLayout] = useState("Vertical");
  const [showCheckboxLayouts, setShowCheckboxLayouts] = useState(false);
  const selectedShapeId = useArtboardStore((state) => state.selectedShapeId);
  const [showLabel, setShowLabel] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [isPlusButtonHovered, setIsPlusButtonHovered] = useState(false);

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);

  const checkboxComponent = shapes?.find(
    (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
  );

  if (!shapes || !checkboxComponent) return null;

  const checkboxWireframeComponent = checkboxComponent as Extract<
    Wireframe,
    { type: "checkbox" }
  >;

  function toggleShowCheckboxLayouts() {
    setShowCheckboxLayouts(!showCheckboxLayouts);
  }

  function toggleShowLabel() {
    setShowLabel(!showLabel);
  }

  function toggleShowDescription() {
    setShowDescription(!showDescription);
  }

  function updateLayout(orientation: string) {
    handleUpdateShape({
      shapeId: checkboxComponent!.id,
      args: {
        type: "checkbox",
        subtype: orientation,
      },
    });
  }

  function updateLabel(content: string) {
    handleUpdateShape({
      shapeId: checkboxComponent!.id,
      args: {
        type: "checkbox",
        label: content,
      },
    });
  }

  const handleUpdateOption = (
    optionId: string,
    content: string,
    isTicked: boolean
  ) => {
    handleUpdateShape({
      shapeId: checkboxComponent!.id,
      args: {
        type: "checkbox",
        options: [
          ...checkboxWireframeComponent.options.map((option) =>
            option.optionId !== optionId
              ? option
              : {
                  optionId: optionId,
                  label: content,
                  isTicked: isTicked,
                }
          ),
        ],
      },
    });
  };

  const handleAddOption = () => {
    handleUpdateShape({
      shapeId: checkboxComponent!.id,
      args: {
        type: "checkbox",
        options: [
          ...checkboxWireframeComponent.options,
          {
            optionId: uuid(),
            label: `Item ${checkboxWireframeComponent.options.length + 1}`,
            isTicked: false,
          },
        ],
      },
    });
  };

  return (
    <div>
      <div className="px-5 py-5 border-b border-b-[#303030]">
        <div className="flex justify-between">
          <p className="">Checkbox</p>
          <img src={ellipsis} alt="" />
        </div>
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowCheckboxLayouts}
        >
          <div className="bg-zinc-600 mt-2 mr-2 h-[5px] w-[18px]"></div>
          <p>{checkboxLayout}</p>
        </div>
      </div>
      <div className="px-5 py-5 border-b border-b-[#303030]">
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowLabel}
        >
          <img src={toggleOff} />
          <p className="px-2">Label</p>
        </div>
        {showLabel && (
          <div>
            <input
              type="text"
              className="bg-transparent border ml-5 mr-2 px-2"
              onChange={(e) => updateLabel(e.target.value)}
            />
          </div>
        )}
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowDescription}
        >
          <img src={toggleOff} />
          <p className="px-2">Description</p>
        </div>
        {/*showDescription && (
          <div>
            <input
              type="text"
              className="bg-transparent border ml-5 mr-2 px-2"
              onChange={(e) => updateDescription(e.target.value)}
            />
          </div>
        )*/}
      </div>
      <div className="px-5 py-5">
        <p className="pb-2">Options</p>
        {checkboxWireframeComponent.options
          ?.sort((a, b) => b.order - a.order)
          .map((option) => (
            <div
              key={option.optionId}
              className="flex py-2 gap-3 hover:cursor-pointer"
            >
              <input
                type="checkbox"
                className="border-2 border-[#A399D4] bg-transparent text-white checked:bg-white checked:text-black p-4"
                checked={option.isTicked}
                onChange={(e) =>
                  debounce(
                    () =>
                      handleUpdateOption(
                        option.optionId,
                        option.label,
                        e.target.checked
                      ),
                    300
                  )
                }
              />
              <input
                className="px-2 bg-transparent"
                value={option.label}
                onChange={(e) =>
                  handleUpdateOption(
                    option.optionId,
                    e.target.value,
                    option.isTicked
                  )
                }
              />
            </div>
          ))}
        <div
          className="flex py-2 gap-4 hover:cursor-pointer"
          onClick={handleAddOption}
          onMouseEnter={() => setIsPlusButtonHovered(true)}
          onMouseLeave={() => setIsPlusButtonHovered(false)}
        >
          <svg
            width="20"
            height="33"
            viewBox="0 0 20 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10"
              cy="17"
              r="10"
              fill={`${isPlusButtonHovered ? "#86C9FF" : "#42A5F5"}`}
            />
            <path
              d="M9.096 23.04V18.168H4.344V16.056H9.096V11.328H11.304V16.056H16.056V18.168H11.304V23.04H9.096Z"
              fill="white"
            />
          </svg>
          <p className="text-xs text-[#42A5F5] hover:text-[#86C9FF] self-center">
            Add more
          </p>
        </div>
      </div>
      {showCheckboxLayouts && (
        <div className="fixed top-[90px] right-[260px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer">
          <div
            className={`py-2 ${
              checkboxLayout == "Vertical" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setCheckboxLayout("Vertical");
              setShowCheckboxLayouts(false);
              updateLayout("column");
            }}
          >
            Vertical
          </div>
          <div
            className={`py-2 ${
              checkboxLayout == "Horizontal" ? "text-blue-500" : ""
            } hover:cursor-pointer`}
            onClick={() => {
              setCheckboxLayout("Horizontal");
              setShowCheckboxLayouts(false);
              updateLayout("horizontal");
            }}
          >
            Horizontal
          </div>
        </div>
      )}
    </div>
  );
}
