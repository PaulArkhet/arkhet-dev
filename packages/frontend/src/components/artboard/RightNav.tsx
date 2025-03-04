import useArtboardStore from "../../store/ArtboardStore";
import { Wireframe } from "@backend/src/interfaces/artboard";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  PageNavigation,
  Route,
} from "../../routes/_authenticated/artboard/$projectId";
import artboardIcon from "/iconartboard.svg";
import datasetIcon from "/icondataset.svg";
import iconx from "/iconx.svg";
import ButtonRightNav from "./rightnav/ButtonRightNav";
import PageRightNav from "./rightnav/PageRightNav";
import CheckboxRightNav from "./rightnav/CheckboxRightNav";
import RadioRightNav from "./rightnav/RadioRightNav";
import DropdownRightNav from "./rightnav/DropdownRightNav";
import InputRightNav from "./rightnav/InputRightNav";
import TextRightNav from "./rightnav/TextRightNav";
import ImageRightNav from "./rightnav/ImageRightNav";
import CardRightNav from "./rightnav/CardRightNav";
import { useQuery } from "@tanstack/react-query";
import { useCreatePrototypeMutation } from "@/lib/api/prototypes";
import { useTriggerGeneration } from "./TopNav";
import { getMultipagePathsQueryOptions } from "@/lib/api/multipage-paths";
import { getAllShapesForProjectQueryOptions } from "@/lib/api/shapes";
import prototypeStore from "@/store/PrototypeStore";

export default function RightNav({
  pageContent,
  setPageContent,
  pageRefList,
}: {
  pageContent: PageNavigation;
  setPageContent: Dispatch<SetStateAction<PageNavigation>>;
  pageRefList: {
    ref: MutableRefObject<HTMLDivElement[]>;
  };
  canvasRef: MutableRefObject<HTMLDivElement | null>;
}) {
  const { selectedShapeId, setSelectedShapeId } = useArtboardStore(
    (state) => state
  );
  const [clickedShape, setClickedShape] = useState<Wireframe>();
  const [isDisabled, setIsDisabled] = useState(false);
  const { project } = Route.useRouteContext();
  const { data: permanentPaths } = useQuery(
    getMultipagePathsQueryOptions({ projectId: project.projectId })
  );
  const { isPrototypeReady, currentPrototype } = prototypeStore(
    (state) => state
  );

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(project.projectId)
  );

  const { triggerGeneration } = useTriggerGeneration(
    pageRefList,
    project,
    permanentPaths,
    true
  );

  useEffect(() => {
    if (!shapes) return;
    const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
    setClickedShape(selectedShape);
  }, [shapes, selectedShapeId]);

  let numberOfPages = shapes
    ? shapes.filter((shape) => shape.type === "page").length
    : 0;

  const renderShapeDetails = () => {
    if (!clickedShape) return null;

    switch (clickedShape.type) {
      case "page":
        return <PageRightNav projectId={project.projectId} />;

      case "button":
        return <ButtonRightNav projectId={project.projectId} />;

      case "checkbox":
        return <CheckboxRightNav projectId={project.projectId} />;

      case "radio":
        return <RadioRightNav projectId={project.projectId} />;

      case "dropdown":
        return <DropdownRightNav projectId={project.projectId} />;

      case "inputField":
        return <InputRightNav />;

      case "text":
        return <TextRightNav projectId={project.projectId} />;

      case "image":
        return <ImageRightNav />;

      case "card":
        return <CardRightNav projectId={project.projectId} />;

      default:
        return null;
    }
  };

  // function handleSecondaryButton(id: number) {}

  return (
    <div className="fixed top-0 right-0 h-screen border-l border-l-zinc-700 bg-[#262626] w-[250px] arkhet-cursor">
      <div className="border-b border-b-zinc-700 flex justify-end py-[2px]">
        <a
          href={
            !currentPrototype
              ? undefined
              : `/prototype/${currentPrototype?.prototypeId}`
          }
          target="_blank"
          className={
            pageContent === "Gen UI"
              ? !currentPrototype || !isPrototypeReady
                ? "w-[195px] bg-[#767676]  flex items-center justify-center gap-3 p-2 mt-2 mb-[6px] mr-2 rounded"
                : "w-[195px] bg-[#9253E4] flex items-center justify-center gap-3 p-2 mt-2 mb-[6px] mr-2 rounded"
              : "hidden"
          }
        >
          <svg
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill={isPrototypeReady ? "#42A5F5" : "#999999"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.28125 0.220513C1.81875 -0.0638115 1.2375 -0.0731849 0.765625 0.192393C0.29375 0.457971 0 0.957883 0 1.50154V12.4996C0 13.0432 0.29375 13.5432 0.765625 13.8087C1.2375 14.0743 1.81875 14.0618 2.28125 13.7806L11.2812 8.28159C11.7281 8.00976 12 7.52547 12 7.00056C12 6.47566 11.7281 5.99449 11.2812 5.71954L2.28125 0.220513Z"
              fill="currentColor"
            />
          </svg>
          <div className="text-sm tracking-widest mb-[1px]">
            VIEW PROTOTYPES
          </div>
        </a>
        {pageContent === "Interaction" && (
          <div
            className={`mr-10 text-sm p-2 px-5 my-2 rounded text-white ${isPrototypeReady && shapes !== undefined && shapes.length > 1 ? "cursor-pointer bg-gradient-to-br from-[#7AA3DC] via-[#6454B7] to-[#B754B3]" : "bg-[#666666]"}`}
            onClick={() => {
              isPrototypeReady &&
                shapes !== undefined &&
                shapes.length > 1 &&
                setPageContent("Gen UI");
              isPrototypeReady &&
                shapes !== undefined &&
                shapes.length > 1 &&
                triggerGeneration();
            }}
          >
            G E N E R A T E
          </div>
        )}
      </div>
      {pageContent === "Interaction" &&
        (selectedShapeId == null ? (
          <div className="py-1 px-2">
            <div className="py-5 px-2">
              <div className="py-2">{numberOfPages} Pages</div>
              {shapes &&
                shapes.map((shape) =>
                  shape.type === "page" ? (
                    <div
                      className="flex py-2"
                      key={shape.type + shape.id + "rightnav"}
                      onClick={() => {
                        setSelectedShapeId(shape.id);
                      }}
                    >
                      <img src={artboardIcon} alt="" />
                      <p className="px-2">{shape.title}</p>
                    </div>
                  ) : null
                )}
            </div>
            {/*<div className="flex justify-between py-2 px-2 rounded-md bg-[#404040]">
              <div className="flex">
                <img src={datasetIcon} alt="" />
                <p className="px-2">Dataset</p>
              </div>
              <div className="flex">
                <p className="px-2">Fan Data 2024</p>
                <img src={iconx} alt="" />
              </div>
            </div>
*/}
          </div>
        ) : (
          renderShapeDetails()
        ))}
    </div>
  );
}
