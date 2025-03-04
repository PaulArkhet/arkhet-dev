import { createFileRoute } from "@tanstack/react-router";
import { useGenerationStore } from "@/store/GenerationStore";
import { LivePreview } from "@/components/live-preview/LivePreview";
import { useRef } from "react";

export const Route = createFileRoute("/prototype")({
  component: RouteComponent,
});

export function RouteComponent() {
  const { code } = useGenerationStore((state) => ({
    code: state.code,
  }));
  const divRef = useRef<HTMLDivElement>(null);
  return (
    <div className="h-screen w-screen relative">
      <LivePreview code={code} ref={divRef} />
    </div>
  );
}
