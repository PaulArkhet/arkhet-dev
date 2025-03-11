import { useCallback, useState } from "react";
import ellipsis from "/iconellipsis.svg";
import toggleOff from "/icontoggleoff.svg";
import plusgrey from "/iconplusgrey.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { Wireframe } from "@backend/src/interfaces/artboard";

export default function RadioRightNav(props: { projectId: number }) {
  const [radioLayout, setRadioLayout] = useState("Vertical");
  const [showRadioLayouts, setShowRadioLayouts] = useState(false);
  const { selectedShapeId } = useArtboardStore((state) => state);
  const [showLabel, setShowLabel] = useState(false);
  // const [showDescription, setShowDescription] = useState(false);

  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);
  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );

  const radioComponent = shapes?.find(shape => shape.id === selectedShapeId && shape.type === "radio");
  
  // Check if shapes is undefined or empty or component was not selected
  if (!shapes || !radioComponent) return;

  const radioWireframeComponent = (radioComponent as Extract<Wireframe, { type: "radio" }>);


  function toggleShowRadioLayouts() {
    setShowRadioLayouts(!showRadioLayouts);
  }

  function toggleShowLabel() {
    setShowLabel(!showLabel);
  }

  // function toggleShowDescription() {
  //   setShowDescription(!showDescription);
  // }

  const updateLayout = (orientation: string) => {
    handleUpdateShape({
      shapeId: radioComponent.id,
      args: {
        type: "radio",
        subtype: orientation,
      },
    });
  }

  const updateLabel = (content: string) => {
    handleUpdateShape({
      shapeId: radioComponent.id,
      args: {
        type: "radio",
        label: content,
      },
    });
  }

  //function updateDescription(content: string) {
  //  if (!shapes) return;

  //  const radioComponent = shapes.find(
  //    (shape) => shape.id === selectedShapeId && shape.type === "radio"
  //  );

  //  if (!radioComponent) return;

  //  handleUpdateShape({
  //    shapeId: radioComponent.id,
  //    args: {
  //      type: "radio",
  //      description: content,
  //    },
  //  });
  //}

  const updateOption = (content: string, index: number) => {
    handleUpdateShape({
      shapeId: radioComponent.id,
      args: {
        type: "radio",
        [`option${index}`]: content,
      },
    });
  }

  return (
    <div>
      <div className="px-5 py-5 border-b border-b-[#303030]">
        <div className="flex justify-between">
          <p className="">Radio</p>
          <img src={ellipsis} alt="" />
        </div>
        <div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowRadioLayouts}
        >
          <div className="bg-zinc-600 mt-2 mr-2 h-[5px] w-[18px]"></div>
          <p>{radioLayout}</p>
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
        {/*<div
          className="flex py-2 hover:cursor-pointer"
          onClick={toggleShowDescription}
        >
          <img src={toggleOff} />
          <p className="px-2">Description</p>
        </div>
        {showDescription && (
          <div>
            <input
              type="text"
              className="bg-transparent border ml-5 mr-2 px-2"
              onChange={(e) => updateDescription(e.target.value)}
            />
          </div>
        )}
      </div> */}
        <div className="px-5 py-5">
          <p className="pb-2">Options</p>
          <div className="flex flex-col">
            <div className="flex py-2">
              <input type="radio" />
              <input
                className="px-2 bg-transparent"
                value={radioWireframeComponent.option1}
                onChange={(e) => updateOption(e.target.value, 1)}
              />
            </div>
            <div className="flex py-2">
              <input type="radio" />
              <input
                className="px-2 bg-transparent"
                value={radioWireframeComponent.option2}
                onChange={(e) => updateOption(e.target.value, 2)}
              />
            </div>
            <div className="flex py-2">
              <input type="radio" />
              <input
                className="px-2 bg-transparent"
                value={radioWireframeComponent.option3}
                onChange={(e) => updateOption(e.target.value, 3)}
              />
            </div>
          </div>
          <div className="flex py-2 hover:cursor-pointer">
            <img src={plusgrey} />
            <p className="px-2 text-[#464646]">Add Option</p>
          </div>
        </div>
        {showRadioLayouts && (
          <div className="fixed top-[90px] right-[260px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer">
            <div
              className={`py-2 ${
                radioLayout == "Vertical" ? "text-blue-500" : ""
              } hover:cursor-pointer`}
              onClick={() => {
                setRadioLayout("Vertical");
                setShowRadioLayouts(false);
                updateLayout("column");
              }}
            >
              Vertical
            </div>
            <div
              className={`py-2 ${
                radioLayout == "Horizontal" ? "text-blue-500" : ""
              } hover:cursor-pointer`}
              onClick={() => {
                setRadioLayout("Horizontal");
                setShowRadioLayouts(false);
                updateLayout("horizontal");
              }}
            >
              Horizontal
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
