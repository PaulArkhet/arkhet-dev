import { LivePreview } from "@/components/live-preview/LivePreview";
import { getPrototypesByPrototypeIdQueryOptions } from "@/lib/api/prototypes";
import { redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/prototype/$prototypeId")({
  beforeLoad: async ({ context, params }) => {
    const { prototypeId: prototypeIdParam } = params;
    try {
      // this can throw...
      const prototypeId = z.coerce.number().int().parse(prototypeIdParam);

      // this can throw...
      const prototype = await context.queryClient.fetchQuery({
        ...getPrototypesByPrototypeIdQueryOptions(prototypeId),
        retry: 4, // exponential backoff 4 retries
      });

      return { prototype };
    } catch (e) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { prototype } = Route.useRouteContext();
  console.log(prototype);
  return (
    <div className="h-screen w-screen relative">
      <LivePreview code={prototype[0].sourceCode} ref={null} />
    </div>
  );
}
