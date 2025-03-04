import {
    createFileRoute,
    Outlet,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api/auth";
import { mightFail } from "might-fail";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: async ({ context }) => {
        const queryClient = context.queryClient;
        const { error: userQueryError, result: userQueryData } =
            await mightFail(queryClient.fetchQuery(userQueryOptions));

        if (userQueryError) throw redirect({ to: "/" });
        return userQueryData;
    },
    component: () => <Outlet />,
});
