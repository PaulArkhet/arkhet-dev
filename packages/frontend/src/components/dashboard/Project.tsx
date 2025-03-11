import imageDelete from "/imagedelete.png";
import trashIcon from "/icontrash.png";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Dispatch, SetStateAction, useState } from "react";
import type { Project } from "@backend/db/schemas/projects";
import {
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "@/lib/api/projects";
import { twMerge } from "tailwind-merge";

export async function handleUpdateTitle(
  e: React.FormEvent<HTMLFormElement>,
  mutateProjectPending: boolean,
  updateProject: (args: {
    title: string;
    active: boolean;
    projectId: number;
  }) => void,
  projectTitle: string,
  projectId: number,
  setEditMode: (value: boolean) => void,
  setShowMenu: (value: boolean) => void
) {
  e.preventDefault();
  if (mutateProjectPending) return;

  updateProject({
    title: projectTitle,
    active: true,
    projectId,
  });
  setEditMode(false);
  setShowMenu(false);
}

export default function Project(props: {
  project: Project;
  showDeleted: boolean;
  setShowDeleted: Dispatch<SetStateAction<boolean>>;
  animateOut: boolean;
  setAnimateOut: Dispatch<SetStateAction<boolean>>;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [projectTitle, setProjectTitle] = useState(props.project.title);
  const { showDeleted, setShowDeleted, animateOut, setAnimateOut } = props;

  const { mutate: updateProject, isPending: mutateProjectPending } =
    useUpdateProjectMutation();

  const {
    mutate: deleteProject,
    isPending: deleteProjectPending,
    isSuccess: deleteProjectSuccess,
  } = useDeleteProjectMutation();

  function toggleMenu(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    e.preventDefault();
    setShowMenu(!showMenu);
  }

  async function handleDeleteProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (deleteProjectPending) return;

    deleteProject(props.project.projectId);
    setShowDeleted(true);
    setDeleteMode(false);
    setEditMode(false);
    setShowMenu(false);
    setTimeout(() => setAnimateOut(true), 1500);
    setTimeout(() => setShowDeleted(false), 2000);
  }

  return (
    <div
      className="border-[0.5px] border-[#373541] hover:border-none rounded-lg overflow-hidden duration-300 ease-in-out hover:shadow-[0_0_8px_2px_rgba(147,51,234,0.6)] w-[19rem] h-[16rem] relative flex flex-col"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => {
        setShowOverlay(false);
        setShowMenu(false);
        setEditMode(false);
      }}
    >
      {deleteMode && (
        <div className="fixed z-[201] py-5 px-2 md:px-5 rounded-lg bg-[#1A1A1A] top-[10%] md:left-[35%] flex flex-col">
          <img src={imageDelete} alt="" />
          <div className="text-xl py-5 font-bold">Delete For Eternity</div>
          <div className="">
            You are about to permanently delete{" "}
            <span className="text-[#D2B1FD]">{props.project.title}</span>
            . This <br /> prototype will be gone forever.
          </div>
          <div className="mx-auto py-2">
            <form onSubmit={handleDeleteProject}>
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
                    deleteProjectPending || deleteProjectSuccess
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
      <Link
        to={`/artboard/${props.project.projectId}`}
        key={props.project.projectId}
        className="relative"
        preload="render"
      >
        <img
          src={props.project.imgSrc}
          alt=""
          className="w-full object-cover h-[calc(16rem_-_56px)]"
        />
      </Link>
      <div
        className="relative z-50 flex flex-col h-[56px] justify-center px-3 bg-[#242029] text-xs gap-1 w-full"
        onClick={() => setEditMode(true)}
      >
        <form
          onSubmit={(e) =>
            handleUpdateTitle(
              e,
              mutateProjectPending,
              updateProject,
              projectTitle,
              props.project.projectId,
              setEditMode,
              setShowMenu
            )
          }
          className="flex flex-col"
        >
          <input
            name="title"
            id="title"
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent focus:outline-none"
          />
          {editMode && <button className="hidden pr-2">Update</button>}
        </form>
      </div>
      <div className="flex flex-col h-[56px] justify-center px-3 bg-[#242029] text-xs gap-1 w-full">
        <p className="text-[#E5E5E5]">
          Edited {formatDistanceToNow(props.project.editedAt)} ago
        </p>
      </div>
      {false && showOverlay && (
        <div className="absolute left-5 top-5 animate-in fade-in">
          <svg
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4465_6614)">
              <path
                d="M7.99732 1C8.25288 1 8.48621 1.14444 8.59732 1.375L10.5029 5.3L14.7584 5.92778C15.0084 5.96389 15.2168 6.13889 15.2945 6.38056C15.3723 6.62222 15.3084 6.88333 15.1307 7.06111L12.0445 10.1222L12.7723 14.4444C12.814 14.6944 12.7112 14.9472 12.5029 15.0972C12.2945 15.2472 12.0223 15.2639 11.8001 15.1444L7.99454 13.1111L4.19454 15.1417C3.96954 15.2611 3.69732 15.2444 3.49177 15.0944C3.28621 14.9444 3.18065 14.6917 3.22232 14.4417L3.9501 10.1194L0.863988 7.06111C0.683432 6.88333 0.622321 6.61944 0.700099 6.38056C0.777877 6.14167 0.98621 5.96667 1.23621 5.92778L5.49177 5.3L7.39732 1.375C7.51121 1.14444 7.74177 1 7.99732 1ZM7.99732 3.19444L6.53899 6.2C6.44177 6.39722 6.25565 6.53611 6.03621 6.56944L2.7501 7.05278L5.13621 9.41667C5.28899 9.56944 5.36121 9.78611 5.3251 10L4.76121 13.325L7.68343 11.7639C7.88065 11.6583 8.11677 11.6583 8.31121 11.7639L11.2334 13.325L10.6723 10.0028C10.6362 9.78889 10.7057 9.57222 10.8612 9.41945L13.2473 7.05556L9.96121 6.56944C9.74454 6.53611 9.55565 6.4 9.45843 6.2L7.99732 3.19444Z"
                fill="#D9D9D9"
              />
            </g>
            <defs>
              <clipPath id="clip0_4465_6614">
                <rect width="16" height="14.2222" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {showOverlay && (
        <div
          className="absolute right-0 top-0 p-5 hover:opacity-80 animate-in fade-in"
          onClick={toggleMenu}
        >
          <svg
            width="14"
            height="4"
            viewBox="0 0 14 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.25 2C0.25 1.53587 0.434374 1.09075 0.762563 0.762563C1.09075 0.434375 1.53587 0.25 2 0.25C2.46413 0.25 2.90925 0.434375 3.23744 0.762563C3.56563 1.09075 3.75 1.53587 3.75 2C3.75 2.46413 3.56563 2.90925 3.23744 3.23744C2.90925 3.56563 2.46413 3.75 2 3.75C1.53587 3.75 1.09075 3.56563 0.762563 3.23744C0.434374 2.90925 0.25 2.46413 0.25 2ZM5.25 2C5.25 1.53587 5.43437 1.09075 5.76256 0.762563C6.09075 0.434375 6.53587 0.25 7 0.25C7.46413 0.25 7.90925 0.434375 8.23744 0.762563C8.56563 1.09075 8.75 1.53587 8.75 2C8.75 2.46413 8.56563 2.90925 8.23744 3.23744C7.90925 3.56563 7.46413 3.75 7 3.75C6.53587 3.75 6.09075 3.56563 5.76256 3.23744C5.43437 2.90925 5.25 2.46413 5.25 2ZM12 0.25C12.4641 0.25 12.9092 0.434375 13.2374 0.762563C13.5656 1.09075 13.75 1.53587 13.75 2C13.75 2.46413 13.5656 2.90925 13.2374 3.23744C12.9092 3.56563 12.4641 3.75 12 3.75C11.5359 3.75 11.0908 3.56563 10.7626 3.23744C10.4344 2.90925 10.25 2.46413 10.25 2C10.25 1.53587 10.4344 1.09075 10.7626 0.762563C11.0908 0.434375 11.5359 0.25 12 0.25Z"
              fill="#D9D9D9"
            />
          </svg>
        </div>
      )}

      {showMenu && (
        <div className="absolute right-5 top-10 bg-[#242424] border border-[#373541] rounded-xl py-5 px-5">
          <div className="flex my-2">
            <img src={trashIcon} className="py-1" />
            <div
              className="pl-2 text-[#D2B1FC] cursor-pointer"
              onClick={() => setDeleteMode(true)}
            >
              Delete
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
