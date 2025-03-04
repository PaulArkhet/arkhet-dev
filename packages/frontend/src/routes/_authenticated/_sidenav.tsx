import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_sidenav")({
    component: RouteComponent,
});

function RouteComponent() {
    const { user } = Route.useRouteContext();
    return (
        <>
            <TopNav user={user} />
            <div className={`flex-grow pl-[200px] flex flex-row`}>
                <SideNav />
                <Outlet />
            </div>
        </>
    );
}
