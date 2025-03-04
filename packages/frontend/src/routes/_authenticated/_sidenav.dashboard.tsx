import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import useArtboardStore from "../../store/ArtboardStore";
import dashboardLegend from "/dashboardbg.png";
import dashboardPlanet from "/dashboardplanet.png";
import SkeletonComponent from "../../components/design-system/components/Skeleton";
import {
  getProjectsQueryOptions,
  useCreateProjectMutation,
} from "@/lib/api/projects";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Project from "@/components/dashboard/Project";
import { twMerge } from "tailwind-merge";
import { getAllShapesForProjectQueryOptions } from "@/lib/api/shapes";
import { useNavigate } from "@tanstack/react-router";
import useDashboardStore from "@/store/DashboardStore";

export const Route = createFileRoute("/_authenticated/_sidenav/dashboard")({
  component: Dashboard,
});

export function getRandomImageSrcForProject() {
  return [
    "/projectThumbnail1.png",
    "/projectThumbnail2.png",
    "/projectThumbnail3.png",
    "/projectThumbnail4.png",
  ][Math.floor(Math.random() * 4)];
}

export async function handleCreateProject(
  isPending: boolean,
  createProject: (args: {
    title: string;
    imgSrc: string;
  }) => Promise<{ projectId?: number } | undefined>,
  getRandomImageSrcForProject: () => string,
  navigate: (args: { to: string; params: { projectId: string } }) => void
) {
  if (isPending) return;

  const res = await createProject({
    title: "New Project",
    imgSrc: getRandomImageSrcForProject(),
  });

  if (res?.projectId) {
    navigate({
      to: "/artboard/$projectId",
      params: { projectId: res.projectId.toString() },
    });
  }
}

function Dashboard() {
  const {
    error: allProjectsQueryError,
    data: allProjectsData,
    isPending: allProjectsQueryPending,
  } = useQuery(getProjectsQueryOptions);
  const { mutateAsync: createProject, isPending } = useCreateProjectMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { loadingProject, setLoadingProject } = useDashboardStore();

  useEffect(() => {
    if (!allProjectsData) return;
    allProjectsData.forEach((project) => {
      queryClient.prefetchQuery(
        getAllShapesForProjectQueryOptions(project.projectId)
      );
    });
  }, [allProjectsData]);

  return (
    <main className="relative w-full">
      {loadingProject && (
        <div className="absolute top-[40%] left-[45%] text-2xl text-white font-bold z-[999]">
          LOADING...
        </div>
      )}
      {loadingProject && (
        <div className="absolute top-[-60px] left-0 bg-black opacity-50 w-full h-screen z-[500]"></div>
      )}
      {allProjectsQueryPending && <SkeletonComponent type="grid" />}
      {allProjectsQueryError && (
        <p>An error occurred while loading projects.</p>
      )}
      {allProjectsData &&
        !allProjectsQueryError &&
        (allProjectsData.filter((project) => project.active).length === 0 ? (
          <div>
            <div className="relative p-5">
              <img src={dashboardLegend} className="pl-7 py-5 w-full" />
              <div className="absolute top-32 left-32 text-4xl font-bold">
                Mission: Build your first prototype
              </div>
              <div className="absolute top-48 left-32">
                Your journey to discovery begins now. Explore, experiment, and
                bring your ideas to life.
              </div>
              <button
                className={twMerge(
                  "absolute bottom-20 right-20 bg-[#9253E4] px-5 py-4 rounded",
                  isPending ? "opacity-80 arhket-cursor" : "cursor-pointer"
                )}
                onClick={() => {
                  setLoadingProject(true);
                  handleCreateProject(
                    isPending,
                    createProject,
                    getRandomImageSrcForProject,
                    navigate
                  );
                  setTimeout(() => setLoadingProject(false), 2000);
                }}
              >
                {isPending ? "Creating..." : "Create Prototype"}
              </button>
            </div>
            {/* <img src={dashboardPlanet} className="mx-auto w-[200px] pt-14" />
            <p className="text-center">
              Access all your prototypes in one space.
            </p> */}
          </div>
        ) : (
          <>
            <h2 className="px-5 text-md mb-5 tracking-widest">PROTOTYPES</h2>
            <div className="px-5 flex flex-row flex-wrap gap-3">
              {allProjectsData
                .filter((project) => project.active)
                .map((project, index) => (
                  <Project project={project} key={index} />
                ))}
            </div>
          </>
        ))}
    </main>
  );
}
