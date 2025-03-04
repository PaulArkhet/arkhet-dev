import { Toaster } from "@/components/ui/toaster";
import { ViewProvider } from "@/components/zoom/ViewContext";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";
import "../index.css";
import "../App.css";
import { type QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

function RootLayout() {
  useEffect(() => {
    document.body.classList.add("arkhet-cursor");
    return () => document.body.classList.remove("arkhet-cursor");
  }, []);

  return (
    <>
      <ViewProvider>
        <div className="flex flex-col min-h-screen w-full bg-zinc-800 text-white font overflow-hidden arkhet-cursor">
          <Outlet />
        </div>
      </ViewProvider>
      <Toaster />
      <TanStackRouterDevtools />
    </>
  );
}
