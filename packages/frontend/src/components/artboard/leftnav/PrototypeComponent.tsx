import { Prototype } from "@backend/db/schemas/prototypes";
import ellipsis from "/iconellipsisvertical.svg";
import { useState } from "react";
import { useUpdatePrototypeTitleMutation } from "@/lib/api/prototypes";
import debounce from "lodash/debounce";

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
  const [editMode, setEditMode] = useState(false);
  const {
    mutate: updatePrototypeTitle,
    isPending: mutatePrototypeTitlePending,
  } = useUpdatePrototypeTitleMutation();

  const debouncedUpdateShape = debounce((updateProps) => {
    handleUpdateTitle();
  }, 300);

  function handleUpdateTitle() {
    if (mutatePrototypeTitlePending) return;
  }

  const debouncedUpdateTitle = debounce(
    (text: string) =>
      updatePrototypeTitle({
        title: text,
        prototypeId: currentPrototype.prototypeId,
      }),
    300
  );

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
      {!editMode && (
        <span>
          {prototype.title
            ? prototype.title
            : "Version " + prototype.prototypeId}
        </span>
      )}
      {editMode && (
        <form onSubmit={handleUpdateTitle}>
          <input
            defaultValue={""}
            onChange={(e) => {
              if (e.target.value === "") return;
              debouncedUpdateTitle(e.target.value);
            }}
            className="bg-transparent text-white outline-none"
          />
          <button className="hidden">Update</button>
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
