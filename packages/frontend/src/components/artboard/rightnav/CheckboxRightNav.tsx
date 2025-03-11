import { useState } from "react";
import ellipsis from "/iconellipsis.svg";
import toggleOff from "/icontoggleoff.svg";
import plusgrey from "/iconplusgrey.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";

export default function CheckboxRightNav(props: { projectId: number }) {
  const [checkboxLayout, setCheckboxLayout] = useState("Vertical");
  const [showCheckboxLayouts, setShowCheckboxLayouts] = useState(false);
  const selectedShapeId = useArtboardStore((state) => state.selectedShapeId);
  const [showLabel, setShowLabel] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);

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
    if (!shapes) return;
    const checkboxComponent = shapes.find(
      (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
    );
    if (!checkboxComponent) return;

    handleUpdateShape({
      shapeId: checkboxComponent.id,
      args: {
        type: "checkbox",
        subtype: orientation,
      },
    });
  }

  function updateLabel(content: string) {
    if (!shapes) return;
    const checkboxComponent = shapes.find(
      (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
    );
    if (!checkboxComponent) return;

    handleUpdateShape({
      shapeId: checkboxComponent.id,
      args: {
        type: "checkbox",
        label: content,
      },
    });
  }

  // function updateDescription(content: string) {
  //   if (!shapes) return;
  //   const checkboxComponent = shapes.find(
  //     (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
  //   );
  //   if (!checkboxComponent) return;

  //   handleUpdateShape({
  //     shapeId: checkboxComponent.id,
  //     args: {
  //       type: "checkbox",
  //       description: content,
  //     },
  //   });
  // }

  function updateOption1(content: string) {
    if (!shapes) return;
    const checkboxComponent = shapes.find(
      (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
    );
    if (!checkboxComponent) return;

    handleUpdateShape({
      shapeId: checkboxComponent.id,
      args: {
        type: "checkbox",
        option1: content,
      },
    });
  }

  function updateOption2(content: string) {
    if (!shapes) return;
    const checkboxComponent = shapes.find(
      (shape) => shape.id === selectedShapeId && shape.type === "checkbox"
    );
    if (!checkboxComponent) return;

    handleUpdateShape({
      shapeId: checkboxComponent.id,
      args: {
        type: "checkbox",
        option2: content,
      },
    });
  }

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
        <div className="flex py-2 hover:cursor-pointer">
          <input
            type="checkbox"
            className="border border-white bg-transparent text-white checked:bg-white checked:text-black"
            defaultChecked
          />
          <input
            className="px-2 bg-transparent"
            value={
              (shapes &&
                shapes.find(
                  (shape) =>
                    shape.id === selectedShapeId && shape.type === "checkbox"
                  //@ts-ignore
                )?.option1) ||
              ""
            }
            onChange={(e) => updateOption1(e.target.value)}
          />
        </div>
        <div className="flex py-2 hover:cursor-pointer">
          <input
            type="checkbox"
            className="border border-white bg-transparent text-white checked:bg-white checked:text-black"
            defaultChecked
          />
          <input
            className="px-2 bg-transparent"
            value={
              (shapes &&
                shapes.find(
                  (shape) =>
                    shape.id === selectedShapeId && shape.type === "checkbox"
                  //@ts-ignore
                )?.option2) ||
              ""
            }
            onChange={(e) => updateOption2(e.target.value)}
          />
        </div>
        <div className="flex py-2 hover:cursor-pointer">
          <img src={plusgrey} />
          <p className="px-2 text-[#464646]">Add Option</p>
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
