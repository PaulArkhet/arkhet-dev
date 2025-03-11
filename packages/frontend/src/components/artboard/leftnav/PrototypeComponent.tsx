import { Prototype } from "@backend/db/schemas/prototypes";
import ellipsis from "/iconellipsisvertical.svg";
import { useState } from "react";
import { useUpdatePrototypeTitleMutation } from "@/lib/api/prototypes";

export default function PrototypeComponent(props: {
  index: number;
  currentPrototype: Prototype;
  prototype: Prototype;
  clickedPrototype: (prototypeId: number) => void;
  handleContextMenu: (e: React.MouseEvent<HTMLLIElement>) => void;
}) {
  const {
    index,
    currentPrototype,
    prototype,
    clickedPrototype,
    handleContextMenu,
  } = props;
  const [showEllipsis, setShowEllipsis] = useState(false);
  const [prototypeTitle, setPrototypeTitle] = useState(
    currentPrototype.title
      ? currentPrototype.title
      : "Version " + currentPrototype.prototypeId
  );
  const [editMode, setEditMode] = useState(false);
  const {
    mutate: updatePrototypeTitle,
    isPending: mutatePrototypeTitlePending,
  } = useUpdatePrototypeTitleMutation();

  function handleUpdateTitle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mutatePrototypeTitlePending) return;
    updatePrototypeTitle({
      title: prototypeTitle,
      prototypeId: currentPrototype.prototypeId,
    });
  }

  return (
    <li
      key={index}
      className={`flex justify-between hover:bg-[#363346] ${
        currentPrototype?.prototypeId === prototype.prototypeId
          ? "bg-[#5B5672] font-bold"
          : ""
      } p-2 cursor-pointer`}
      onClick={(e) => {
        clickedPrototype(prototype.prototypeId);
        handleContextMenu(e);
      }}
      onDoubleClick={() => setEditMode(true)}
      onMouseEnter={() => setShowEllipsis(true)}
      onMouseLeave={() => {
        setShowEllipsis(false);
        setEditMode(false);
      }}
    >
      {!editMode && <span>Version {prototype.prototypeId}</span>}
      {editMode && (
        <form onSubmit={handleUpdateTitle}>
          <input
            value={prototypeTitle || ""}
            onChange={(e) => setPrototypeTitle(e.target.value)}
            className="bg-transparent text-white outline-none"
          />
          <button className="hidden pr-2">Update</button>
        </form>
      )}
      {prototype.prototypeId === currentPrototype?.prototypeId ? (
        <div>
          <img src={ellipsis} className="w-[20px]" alt="" />
        </div>
      ) : showEllipsis ? (
        <div>
          <img src={ellipsis} className="w-[20px]" alt="" />
        </div>
      ) : (
        ""
      )}
    </li>
  );
}
