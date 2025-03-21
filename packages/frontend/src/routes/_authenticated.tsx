import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api/auth";
import { mightFail } from "might-fail";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;
    const { error: userQueryError, result: userQueryData } = await mightFail(
      queryClient.fetchQuery(userQueryOptions)
    );

    if (userQueryError) throw redirect({ to: "/" });
    if (userQueryData.type === "invalid") {
      throw redirect({ to: "/unauthorized" });
    }

    const { user } = userQueryData;

    return userQueryData;
  },
  component: () => <Outlet />,
});
