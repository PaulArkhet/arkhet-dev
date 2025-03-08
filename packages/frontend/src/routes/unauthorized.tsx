import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen w-screen bg-[#0a0a0a]">
      <div className="absolute left-[40%] top-[40%] text-4xl">
        Please contact Nate
      </div>
    </div>
  );
}
