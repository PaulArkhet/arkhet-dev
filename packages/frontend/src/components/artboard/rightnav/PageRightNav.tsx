import { useEffect, useState } from "react";
import caretDown from "/iconcaretdown.png";
import desktopIcon from "/icondesktop.png";
import iconsync from "/iconsync.svg";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import { Wireframe } from "@backend/src/interfaces/artboard";

export default function PageRightNav(props: { projectId: number }) {
  const { selectedShapeId } = useArtboardStore((state) => state);

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);

  const [pageComponent, setPageComponent] = useState<null | Extract<
    Wireframe,
    { type: "page" }
  >>(null);
  useEffect(() => {
    if (!shapes) return;
    const possibleShapeComponent = shapes.find(
      (shape) => shape.id === selectedShapeId
    );
    if (possibleShapeComponent && possibleShapeComponent.type === "page") {
      setPageComponent(possibleShapeComponent);
      setCurrentMode(possibleShapeComponent.subtype);
    } else {
      setPageComponent(null);
    }
  }, [shapes]);
  //
  //
  const [showMenu, setShowMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState<string | false>(false);

  function toggleShowMenu() {
    setShowMenu(!showMenu);
  }

  function updatePageType(subtype: string) {
    if (!pageComponent) return;
    let newWidth;
    let newHeight = 562;

    if (subtype === "Desktop") {
      newWidth = 1000;
    } else {
      newWidth = 461; 
    } 
    
    handleUpdateShape({
      shapeId: pageComponent.id,
      args: {
        type: "page",
        subtype,
        width: newWidth,
        height: newHeight,
      },
    });
  }

  return (
    <div>
      <div className="px-5 py-5 border-b border-b-[#303030]">
        <div className="flex pb-2 cursor-pointer" onClick={toggleShowMenu}>
          <img src={desktopIcon} alt="" className="w-[10px] py-2" />
          <p className="px-2">{currentMode} Canvas</p>

          <img
            src={caretDown}
            alt=""
            className={`mr-2 w-[10px] py-2 ${showMenu && "rota"}`}
          />
        </div>
        {showMenu && (
          <div>
            <div
              className={`${
                currentMode === "Desktop"
                  ? "flex pb-2 cursor-pointer text-blue-500"
                  : "flex pb-2 cursor-pointer"
              }`}
              onClick={() => {
                setCurrentMode("Desktop");
                setShowMenu(false);
                updatePageType("Desktop");
              }}
            >
              <img src={desktopIcon} alt="" className="w-[10px] py-2" />
              <p className="px-2">Desktop Canvas</p>
            </div>
            <div
              className={`${
                currentMode === "Mobile"
                  ? "flex pb-2 cursor-pointer text-blue-500"
                  : "flex pb-2 cursor-pointer"
              }`}
              onClick={() => {
                setCurrentMode("Mobile");
                setShowMenu(false);
                updatePageType("Mobile");
              }}
            >
              <img src={desktopIcon} alt="" className="w-[10px] py-2" />
              <p className="px-2">Mobile Canvas</p>
            </div>
          </div>
        )}
        {!showMenu && (
          <div className="flex">
            {currentMode == "Desktop" && (
              <div className="px-2">
                W <span className="underline">1920</span>
              </div>
            )}
            {currentMode == "Mobile Canvas" && (
              <div className="px-2">
                W <span className="underline">320</span>
              </div>
            )}
            <img src={iconsync} />
            <div className="px-2">
              H <span className="underline">auto</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
