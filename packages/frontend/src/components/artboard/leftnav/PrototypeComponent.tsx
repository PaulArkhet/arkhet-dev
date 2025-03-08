import { Prototype } from "@backend/db/schemas/prototypes";
import ellipsis from "/iconellipsisvertical.svg";
import { useState } from "react";

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
      onMouseEnter={() => setShowEllipsis(true)}
      onMouseLeave={() => setShowEllipsis(false)}
    >
      <span>Version {prototype.prototypeId}</span>
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
