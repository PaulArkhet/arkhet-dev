import { Link } from "@tanstack/react-router";
import { v4 } from "uuid";
import logo from "/Arkhet-logo_white 1.png";
import caretDown from "/iconcaretdown.png";
import caretRight from "/iconcaretright.png";
import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useArtboardStore from "../../store/ArtboardStore";
import { PageNavigation } from "@/routes/_authenticated/artboard/$projectId";
import { Button } from "../ui/button";
import { ViewContext } from "../zoom/ViewContext";
import ButtonComponent from "./leftnav/ButtonComponent";
import TextComponent from "./leftnav/TextComponent";
import CheckboxComponent from "./leftnav/CheckboxComponent";
import RadiobuttonComponent from "./leftnav/RadiobuttonComponent";
import ToggleComponent from "./leftnav/ToggleComponent";
import DividerComponentt from "./leftnav/DividerComponent";
import CardComponent from "./leftnav/CardComponent";
import CircleComponent from "./leftnav/CircleComponent";
import ImageComponent from "./leftnav/ImageComponent";
import InputFieldComponent from "./leftnav/InputFieldComponent";
import DropdownComponent from "./leftnav/DropdownComponent";
import ChatbotComponent from "./leftnav/ChatbotComponent";
import NavigationComponent from "./leftnav/NavigationComponent";
import RectangleComponent from "./leftnav/RectangleComponent";
import trashIcon from "/icontrash.png";
import { Project } from "@backend/db/schemas/projects";
import { useQuery } from "@tanstack/react-query";
import {
  getPrototypesByProjectIdQueryOptions,
  useDeletePrototypeMutation,
} from "@/lib/api/prototypes";
import prototypeStore from "@/store/PrototypeStore";
import {
  getAllShapesForProjectQueryOptions,
  useCreateShapeMutation,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import PrototypeComponent from "./leftnav/PrototypeComponent";
import { useTriggerGeneration } from "./TopNav";
import imageDelete from "/imagedelete.png";
import { twMerge } from "tailwind-merge";

export default function LeftNav(props: {
  pageContent: PageNavigation;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
  project: Project;
  pageRefList: MutableRefObject<HTMLDivElement[]>;
  permanentPaths:
    | {
        projectId: number;
        createdAt: Date;
        editedAt: Date;
        id: number;
        shapeStartId: string;
        shapeStartHandleType: "left" | "right" | "top" | "bottom";
        shapeEndId: string;
        shapeEndHandleType: "left" | "right" | "top" | "bottom";
        pageExcludeList: string[];
        direction: "vertical" | "horizontal";
      }[]
    | undefined;
}) {
  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.project.projectId)
  );

  const { mutate: handleAddShape } = useCreateShapeMutation(
    props.project.projectId
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(
    props.project.projectId
  );

  const { selectedShapeId, setSelectedShapeId } = useArtboardStore(
    (state) => state
  );

  const { currentPrototype, setCurrentPrototype, isPrototypeReady } =
    prototypeStore((state) => state);

  const [showComponents, setShowComponents] = useState(true);
  const [showCustomComponents, setShowCustomComponents] = useState(true);
  // const [showLayers, setShowLayers] = useState(true);
  const [searchContent, setSearchContent] = useState("");
  const view = useContext(ViewContext);
  const { data: prototypesQuery } = useQuery(
    getPrototypesByProjectIdQueryOptions(props.project.projectId)
  );
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { triggerGeneration } = useTriggerGeneration(
    { ref: props.pageRefList },
    props.project,
    props.permanentPaths,
    true
  );
  const [deleteMode, setDeleteMode] = useState(false);

  function handleContextMenu(event: React.MouseEvent<HTMLLIElement>) {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
  }

  const {
    mutate: deletePrototype,
    isPending: deletePrototypePending,
    isSuccess: deletePrototypeSuccess,
  } = useDeletePrototypeMutation();

  // function toggleShowLayers() {
  //   setShowLayers(!showLayers);
  // }

  function clickedPrototype(id: number) {
    console.log(currentPrototype?.prototypeId);
    console.log(currentPrototype);
    console.log(prototypesQuery);
    if (prototypesQuery !== undefined) {
      prototypesQuery.forEach((prototype) => {
        if (prototype.prototypeId === id) {
          setCurrentPrototype(prototype);
        }
      });
    }
  }
  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current === null) return setContextMenu(null);
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setContextMenu(null);
    }
  }

  function handleDeletePrototype(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    deletePrototype({
      prototypeId: currentPrototype?.prototypeId || 0,
      projectId: currentPrototype?.projectId || 0,
    });
    setDeleteMode(false);
  }

  useEffect(() => {
    console.log(currentPrototype);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div>
      {contextMenu?.visible && (
        <div
          className={`absolute left-64 z-[999] bg-[#1A1A1A] py-2 px-5 rounded-xl`}
          style={{ top: (contextMenu && contextMenu.y - 25) || 0 }}
        >
          {/* <div
            className="py-1 bg-gradient-to-r from-[#7695D6] via-[#6B6DC3] to-[#6554B7] inline-block text-transparent bg-clip-text"
            onClick={() => triggerGeneration()}
          >
            Regenerate
          </div> */}
          <div className="py-1" onClick={() => setDeleteMode(true)}>
            Delete this version
          </div>
          {/* <div className="py-1">Update prototype name</div> */}
        </div>
      )}
      {deleteMode && (
        <div className="fixed z-[201] py-5 px-2 md:px-5 rounded-lg bg-[#1A1A1A] top-[10%] md:left-[35%] flex flex-col">
          <img src={imageDelete} alt="" />
          <div className="text-xl py-5 font-bold">Delete For Eternity</div>
          <div className="">
            You are about to permanently delete{" "}
            <span className="text-[#D2B1FD]">
              prototype version {currentPrototype?.prototypeId}
            </span>
            . This <br /> prototype will be gone forever.
          </div>
          <div className="mx-auto py-2">
            <form onSubmit={handleDeletePrototype}>
              <input
                name="content"
                id="content"
                defaultValue="[this message was deleted]"
                className="hidden"
              />
              <div className="flex pl-64">
                <button
                  className="hidden md:block md:pb-1 edit-btn cursor-pointer px-5 py-2 md:my-2 mx-2 bg-[#BABABA] rounded hover:bg-[#fafafa] transition-all ease duration-300 text-black tracking-widest"
                  onClick={() => setDeleteMode(false)}
                >
                  CANCEL
                </button>
                <button
                  className={twMerge(
                    "hidden md:block delete-btn  px-5 py-2 md:my-2 bg-[#DD4B63] rounded transition-all ease duration-300 tracking-widest",
                    deletePrototypePending || deletePrototypeSuccess
                      ? "opacity-70 arkhet-cursor  hover:bg-red-600"
                      : "cursor-pointer"
                  )}
                >
                  DELETE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteMode && (
        <div
          className="fixed inset-0 bg-black z-[200] opacity-70"
          onClick={() => setDeleteMode(false)}
        ></div>
      )}
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-zinc-900 overflow-auto arkhet-cursor">
        <div
          className="border-b-zinc-700 border-b-[1px] p-2  pr-10 pl-4"
          onClick={() => {
            setCurrentPrototype(null);
          }}
        >
          <Link to="/dashboard" className="flex items-center">
            <img src={logo} alt="Arkhet Logo" className="pr-2 scale-75" />
            <p className="font pt-1 text-lg tracking-widest">ARKHET</p>
          </Link>
        </div>

        {props.pageContent === "Interaction" && (
          <>
            <div className="flex my-2 py-2 pl-4 text-sm border-b-[1px] border-b-zinc-700">
              <div className="flex justify-center items-center">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_2642_26774)">
                    <path
                      d="M6.5 3.25C6.5 3.96719 6.26719 4.62969 5.875 5.16719L7.85312 7.14687C8.04844 7.34219 8.04844 7.65937 7.85312 7.85469C7.65781 8.05 7.34062 8.05 7.14531 7.85469L5.16719 5.875C4.62969 6.26875 3.96719 6.5 3.25 6.5C1.45469 6.5 0 5.04531 0 3.25C0 1.45469 1.45469 0 3.25 0C5.04531 0 6.5 1.45469 6.5 3.25ZM3.25 5.5C3.54547 5.5 3.83805 5.4418 4.11104 5.32873C4.38402 5.21566 4.63206 5.04992 4.84099 4.84099C5.04992 4.63206 5.21566 4.38402 5.32873 4.11104C5.4418 3.83805 5.5 3.54547 5.5 3.25C5.5 2.95453 5.4418 2.66194 5.32873 2.38896C5.21566 2.11598 5.04992 1.86794 4.84099 1.65901C4.63206 1.45008 4.38402 1.28434 4.11104 1.17127C3.83805 1.0582 3.54547 1 3.25 1C2.95453 1 2.66194 1.0582 2.38896 1.17127C2.11598 1.28434 1.86794 1.45008 1.65901 1.65901C1.45008 1.86794 1.28434 2.11598 1.17127 2.38896C1.0582 2.66194 1 2.95453 1 3.25C1 3.54547 1.0582 3.83805 1.17127 4.11104C1.28434 4.38402 1.45008 4.63206 1.65901 4.84099C1.86794 5.04992 2.11598 5.21566 2.38896 5.32873C2.66194 5.4418 2.95453 5.5 3.25 5.5Z"
                      fill="currentColor"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2642_26774">
                      <rect width="8" height="8" fill="currentColor" />
                    </clipPath>
                  </defs>
                </svg>
                <input
                  type="text"
                  className="mt-1 font pl-3 bg-transparent outline-none"
                  placeholder="Search..."
                  onChange={(e) => setSearchContent(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="pl-4 pb-2 border-b border-b-[#303030]">
                {!showComponents && (
                  <div
                    className="flex w-[200px] py-2 cursor-pointer"
                    onClick={() => setShowComponents(true)}
                  >
                    <img
                      src={caretRight}
                      alt=""
                      className="mr-2 h-[15px] w-[7px] pt-2"
                    />
                    <p>Basic Components</p>
                  </div>
                )}
                {showComponents && (
                  <div
                    className="flex w-[200px] py-2 cursor-pointer"
                    onClick={() => setShowComponents(false)}
                  >
                    <img
                      src={caretDown}
                      alt=""
                      className="mr-2 w-[10px] py-2"
                    />
                    <p>Basic Components</p>
                  </div>
                )}
                {showComponents && (
                  <div className="grid grid-cols-3 gap-2 pr-4 pb-2">
                    <ButtonComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <TextComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <CheckboxComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <RadiobuttonComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <ToggleComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <DividerComponentt
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <CircleComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <ImageComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <InputFieldComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    {/* <DropdownComponent
                    canvasRef={props.canvasRef}
                    projectId={props.project.projectId}
                  /> */}
                    {/* <ChatbotComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                    <NavigationComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    /> */}
                    <RectangleComponent
                      canvasRef={props.canvasRef}
                      projectId={props.project.projectId}
                    />
                  </div>
                )}
                {/* {!showCustomComponents && (
                <div
                  className="flex w-[200px] py-2 cursor-pointer"
                  onClick={() => setShowCustomComponents(true)}
                >
                  <img
                    src={caretRight}
                    alt=""
                    className="mr-2 h-[15px] w-[7px] pt-2"
                  />
                  <p>Custom Components</p>
                </div>
              )}
              {showCustomComponents && (
                <div
                  className="flex w-[200px] py-2 cursor-pointer"
                  onClick={() => setShowCustomComponents(false)}
                >
                  <img src={caretDown} alt="" className="mr-2 w-[10px] py-2" />
                  <p>Custom Components</p>
                </div>
              )}
              {showCustomComponents && (
                <div className="">
                  <CardComponent
                    canvasRef={props.canvasRef}
                    projectId={props.project.projectId}
                  />
                </div>
              )}
              {showCustomComponents &&
                shapes &&
                shapes
                  .filter((shape) => shape.type == "card")
                  .map((shape) => (
                    <div
                      className={`flex justify-between py-2 px-2 mr-5 mb-2 cursor-pointer
                                            hover:text-[#42A5F5] hover:bg-[#202020] rounded transition-all ease-in-out duration-200`}
                      onClick={() => {
                        handleAddShape({
                          type: "instance",
                          projectId: props.project.projectId,
                          scale: view!.scale,
                          canvasRef: props.canvasRef,
                          shapeId: v4(),
                        });
                        shape.hasInstances = true;
                      }}
                      key={shape.type + shape.id + "leftnav"}
                    >
                      <p>
                        {shape.title} {shape.id}
                      </p>
                      <div className="flex">
                        <img
                          src={trashIcon}
                          className="h-[20px] w-[12px] pt-1"
                        />
                      </div>
                    </div>
                  ))} */}
                {/* {!showDataInput && (
                                <div
                                    className="flex w-[200px] py-2 cursor-pointer"
                                    onClick={() => setShowDataInput(true)}
                                >
                                    <img
                                        src={caretRight}
                                        alt=""
                                        className="mr-2 h-[15px] w-[7px] pt-2"
                                    />
                                    <p>Data Input</p>
                                </div>
                            )}
                            {showDataInput && (
                                <div
                                    className="flex w-[200px] py-2 cursor-pointer"
                                    onClick={() => setShowDataInput(false)}
                                >
                                    <img
                                        src={caretDown}
                                        alt=""
                                        className="mr-2 w-[10px] py-2"
                                    />
                                    <p>Data Input</p>
                                </div>
                            )}
                            <div className="flex w-[200px] py-2 cursor-pointer">
                                <img
                                    src={caretRight}
                                    alt=""
                                    className="mr-2 h-[15px] w-[7px] pt-2"
                                />
                                <p>Navigation</p>
                            </div>
                            <div className="flex w-[200px] py-2 cursor-pointer">
                                <img
                                    src={caretRight}
                                    alt=""
                                    className="mr-2 h-[15px] w-[7px] pt-2"
                                />
                                <p>Special Components</p>
                            </div>
                        </div>
                        <div className="pl-4 pt-2">
                            <div className="flex w-[200px] py-2 cursor-pointer">
                                <img
                                    src={caretRight}
                                    alt=""
                                    className="mr-2 h-[15px] w-[7px] pt-2"
                                />
                                <p>User Flow</p>
                            </div>
                            <div className="flex w-[200px] py-2 cursor-pointer">
                                <img
                                    src={caretRight}
                                    alt=""
                                    className="mr-2 h-[15px] w-[7px] pt-2"
                                />
                                <p>Logic</p>
                            </div>
                            <div className="flex w-[200px] py-2 cursor-pointer">
                                <img
                                    src={caretRight}
                                    alt=""
                                    className="mr-2 h-[15px] w-[7px] pt-2"
                                />
                                <p>Transitions & Effects</p>
                            </div> */}
                {/* <div className="border-t border-t-[#303030]">
                <div
                  className="flex w-[200px] py-2 cursor-pointer"
                  onClick={toggleShowLayers}
                >
                  <img
                    src={showLayers ? caretDown : caretRight}
                    alt=""
                    className={`${
                      showLayers
                        ? "mr-2 w-[10px] py-2"
                        : "mr-2 h-[15px] w-[7px] pt-2"
                    }`}
                  />
                  <p>Layers</p>
                </div>
                {showLayers &&
                  shapes &&
                  shapes.map((shape) => (
                    <div
                      className={`flex justify-between py-2 px-2 mr-5 cursor-pointer ${
                        selectedShapeId === shape.id ? "bg-blue-500" : ""
                      }`}
                      onClick={() => setSelectedShapeId(shape.id)}
                      key={shape.type + shape.id + "leftnav"}
                    >
                      <p>
                        {shape.type} {shape.id}
                      </p>
                      <div className="flex">
                        <div
                          onClick={() =>
                            handleUpdateShape({
                              shapeId: shape.id,
                              args: {
                                zIndex: shape.zIndex + 1,
                                type: shape.type,
                              },
                            })
                          }
                          className="mr-2"
                        >
                          up
                        </div>
                        <div
                          onClick={() =>
                            handleUpdateShape({
                              shapeId: shape.id,
                              args: {
                                zIndex: Math.max(shape.zIndex - 1, 0),
                                type: shape.type,
                              },
                            })
                          }
                        >
                          down
                        </div>
                      </div>
                    </div>
                  ))}
              </div> */}
              </div>
            </div>
          </>
        )}

        {props.pageContent === "Gen UI" && isPrototypeReady && (
          <div className="px-3 py-6">
            <h3 className="text-md text-[#E5E5E5] font-semibold">
              Prototype History
            </h3>
            <div
              className="mt-2 space-y-2 text-sm text-[#E5E5E5]"
              ref={menuRef || null}
            >
              {prototypesQuery !== undefined &&
                prototypesQuery
                  .filter((prototype) => prototype.active)
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((prototype, index) => (
                    <PrototypeComponent
                      index={index}
                      currentPrototype={currentPrototype!}
                      prototype={prototype}
                      clickedPrototype={clickedPrototype}
                      handleContextMenu={handleContextMenu}
                      key={prototype.prototypeId}
                    />
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
