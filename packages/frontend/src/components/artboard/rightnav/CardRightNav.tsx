import {
  getAllShapesForProjectQueryOptions,
  useUpdateShapeMutation,
} from "@/lib/api/shapes";
import useArtboardStore from "../../../store/ArtboardStore";
import { useQuery } from "@tanstack/react-query";
import { Wireframe } from "@backend/src/interfaces/artboard";

export default function CardRightNav(props: { projectId: number }) {
  const { selectedShapeId } = useArtboardStore((state) => state);

  const { data: shapes } = useQuery(
    getAllShapesForProjectQueryOptions(props.projectId)
  );
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);

  function updateTitle(content: string) {
    if (!shapes) return;
    const cardComponent = shapes.find((shape) => shape.id === selectedShapeId);
    if (!cardComponent || cardComponent.type !== "card") return;

    handleUpdateShape({
      shapeId: cardComponent.id,
      args: {
        type: cardComponent.type,
        title: content,
      },
    });
  }

  function updateDescription(content: string) {
    if (!shapes) return;
    const cardComponent = shapes.find((shape) => shape.id === selectedShapeId);
    if (!cardComponent || cardComponent.type !== "card") return;

    handleUpdateShape({
      shapeId: cardComponent.id,
      args: {
        type: cardComponent.type,
        description: content,
      },
    });
  }

  return (
    <div className="p-5">
      {shapes && (
        <>
          <input
            type="text"
            value={
              (
                shapes.find(
                  (shape) =>
                    shape.id === selectedShapeId && shape.type === "card"
                )! as Extract<Wireframe, { type: "card" }>
              ).title
            }
            onChange={(e) => updateTitle(e.target.value)}
            className="bg-transparent p-2 my-5 outline-none"
          />
          <input
            type="text"
            value={
              (
                shapes.find(
                  (shape) =>
                    shape.id === selectedShapeId && shape.type === "card"
                )! as Extract<Wireframe, { type: "card" }>
              ).description
            }
            onChange={(e) => updateDescription(e.target.value)}
            className="bg-transparent p-2 my-5 outline-none"
          />
        </>
      )}
    </div>
  );
}
