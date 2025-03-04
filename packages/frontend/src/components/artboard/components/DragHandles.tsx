import { Wireframe } from "@backend/src/interfaces/artboard";

export function DragHandles(props: {
  shape: Wireframe;
  selectedShapeId: string | null;
}) {
  return (
    props.shape.type === "page"
      ? ["right-[8px] bottom-[8px]", "left-[8px] bottom-[8px]"]
      : ["right-1 bottom-1", "left-1 bottom-1", "left-1 top-1", "right-1 top-1"]
  ).map((position, index) => (
    <div
      key={index}
      className={`absolute aspect-square bg-[#2c2c2c] border border-[#70acdc] w-2 h-2 z-[999]
                    ${position} ${props.selectedShapeId === props.shape.id ? "block" : "hidden"}`}
    />
  ));
}
