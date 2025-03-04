import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import logo from "/Arkhet-logo_white 1.png";
import { Page, pages } from "../store/SideNavStore";
import logoutIcon from "/iconlogout2.svg";
import {
  getProjectsQueryOptions,
  useCreateProjectMutation,
} from "@/lib/api/projects";
import { client } from "@/lib/api/client";
import {
  getRandomImageSrcForProject,
  handleCreateProject,
} from "@/routes/_authenticated/_sidenav.dashboard";
import { useQuery } from "@tanstack/react-query";
import useDashboardStore from "@/store/DashboardStore";

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("dashboard");
  const { mutateAsync: createProject, isPending } = useCreateProjectMutation();
  const {
    error: allProjectsQueryError,
    data: allProjectsData,
    isPending: allProjectsQueryPending,
  } = useQuery(getProjectsQueryOptions);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { loadingProject, setLoadingProject } = useDashboardStore();

  function handleLogout() {
    const result = client.api.v0.auth.logout.$url();
    window.location.href = result.toString();
  }

  useEffect(() => {
    const currentPage = pages.find((page) => page.path === location.pathname);
    if (currentPage) {
      setActivePage(currentPage.name);
    }
  }, [location.pathname, setActivePage]);

  function changeActivePage(name: Page["name"]) {
    setActivePage(name);
    navigate({ to: pages.find((page) => page.name === name)!.path });
  }

  return (
    <div className="fixed z-50 bg-zinc-900 pl-4 pt-5 h-auto min-h-screen w-[200px] top-0 left-0 flex flex-col border-r border-[#303030] overflow-y-auto justify-between">
      <div>
        <div
          onClick={() => changeActivePage("dashboard")}
          className="flex items-center gap-1 cursor-pointer"
        >
          <img src={logo} alt="Arkhet Logo" className="h-8 w-auto" />
          <p className="text-xl ml-2">A R K H E T</p>
        </div>
        {allProjectsData &&
          allProjectsData.filter((project) => project.active).length !== 0 && (
            <div
              className="flex mt-10 p-2 text-sm rounded bg-[#9253E4] w-36 hover:cursor-pointer"
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
              <button className="flex flex-row gap-2 pl-2 items-center">
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 11 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.16667 13.5938C9.41875 13.5938 9.625 13.3828 9.625 13.125V4.6875H7.33333C6.8263 4.6875 6.41667 4.26855 6.41667 3.75V1.40625H1.83333C1.58125 1.40625 1.375 1.61719 1.375 1.875V13.125C1.375 13.3828 1.58125 13.5938 1.83333 13.5938H9.16667ZM0 1.875C0 0.84082 0.822135 0 1.83333 0H6.57422C7.0612 0 7.52812 0.196289 7.87187 0.547852L10.4643 3.19922C10.8081 3.55078 11 4.02832 11 4.52637V13.125C11 14.1592 10.1779 15 9.16667 15H1.83333C0.822135 15 0 14.1592 0 13.125V1.875Z"
                    fill="white"
                  />
                </svg>
                <p>{isPending ? "Creating..." : "New Prototype"}</p>
              </button>
            </div>
          )}
        <div className="relative mt-8 flex flex-col gap-6">
          <h2 className="text-zinc-400">Workspace</h2>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className=" cursor-pointer flex flex-col"
          >
            <div
              className={`flex text-sm rounded-md ${
                activePage === "dashboard" ? "text-purple-300" : "text-white"
              }`}
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={
                  activePage === "dashboard"
                    ? "fill-current text-purple-300"
                    : "fill-current text-white"
                }
              >
                <path
                  d="M5.91155 1.68735L8.98105 4.94979L12.0506 1.68735H5.91155ZM13.4678 2.63802L10.928 5.33567H15.4533L13.4678 2.63802ZM15.2218 7.01951H8.98105H2.74031L8.98105 13.9057L15.2218 7.01951ZM2.50878 5.33567H7.03411L4.49431 2.63802L2.50878 5.33567ZM17.744 6.74238L9.60547 15.7229C9.44761 15.8983 9.21959 16 8.98105 16C8.7425 16 8.51799 15.8983 8.35662 15.7229L0.218057 6.74238C-0.0520588 6.4442 -0.0731068 5.99868 0.165437 5.67595L4.0944 0.343784C4.25226 0.129796 4.50484 0 4.77145 0H13.1907C13.4573 0 13.7098 0.126288 13.8677 0.343784L17.7967 5.67595C18.0352 5.99868 18.0106 6.4442 17.744 6.74238Z"
                  className="fill-current"
                />
              </svg>

              <p className="pl-3">Home</p>
            </div>
          </button>
          <button
            onClick={() => navigate({ to: "/design-system" })}
            className="cursor-pointer"
          >
            <div
              className={`flex text-sm rounded-md ${
                activePage === "designSystem" ? "text-purple-300" : "text-white"
              }`}
            >
              <svg
                width="16"
                height="19"
                viewBox="0 0 16 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={
                  activePage === "designSystem"
                    ? "fill-current text-purple-300"
                    : "fill-current text-white"
                }
              >
                <path d="M3.42857 0C1.53571 0 0 1.53571 0 3.42857V14.8571C0 16.75 1.53571 18.2857 3.42857 18.2857H13.7143H14.8571C15.4893 18.2857 16 17.775 16 17.1429C16 16.5107 15.4893 16 14.8571 16V13.7143C15.4893 13.7143 16 13.2036 16 12.5714V1.14286C16 0.510714 15.4893 0 14.8571 0H13.7143H3.42857ZM3.42857 13.7143H12.5714V16H3.42857C2.79643 16 2.28571 15.4893 2.28571 14.8571C2.28571 14.225 2.79643 13.7143 3.42857 13.7143ZM4.57143 5.14286C4.57143 4.82857 4.82857 4.57143 5.14286 4.57143H12C12.3143 4.57143 12.5714 4.82857 12.5714 5.14286C12.5714 5.45714 12.3143 5.71429 12 5.71429H5.14286C4.82857 5.71429 4.57143 5.45714 4.57143 5.14286ZM5.14286 6.85714H12C12.3143 6.85714 12.5714 7.11429 12.5714 7.42857C12.5714 7.74286 12.3143 8 12 8H5.14286C4.82857 8 4.57143 7.74286 4.57143 7.42857C4.57143 7.11429 4.82857 6.85714 5.14286 6.85714Z" />
              </svg>

              <p className="pl-3">Design System</p>
            </div>
          </button>
          <button
            onMouseEnter={() => setShowComingSoon(true)}
            onMouseLeave={() => setShowComingSoon(false)}
          >
            <div
              className={`flex text-sm rounded-md ${
                activePage === "dataset" ? "text-purple-300" : "text-white"
              }`}
            >
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={
                  activePage === "dataset"
                    ? "fill-current text-purple-300"
                    : "fill-current text-white"
                }
              >
                <path d="M16 2.8125V4.5C16 6.05391 12.4179 7.3125 8 7.3125C3.58214 7.3125 0 6.05391 0 4.5V2.8125C0 1.25859 3.58214 0 8 0C12.4179 0 16 1.25859 16 2.8125ZM14.0429 7.54805C14.7857 7.28789 15.4679 6.95391 16 6.54258V10.125C16 11.6789 12.4179 12.9375 8 12.9375C3.58214 12.9375 0 11.6789 0 10.125V6.54258C0.532143 6.95742 1.21429 7.28789 1.95714 7.54805C3.56071 8.11055 5.69643 8.4375 8 8.4375C10.3036 8.4375 12.4393 8.11055 14.0429 7.54805ZM0 12.1676C0.532143 12.5824 1.21429 12.9129 1.95714 13.173C3.56071 13.7355 5.69643 14.0625 8 14.0625C10.3036 14.0625 12.4393 13.7355 14.0429 13.173C14.7857 12.9129 15.4679 12.5789 16 12.1676V15.1875C16 16.7414 12.4179 18 8 18C3.58214 18 0 16.7414 0 15.1875V12.1676Z" />
              </svg>

              <p className="pl-3 text-[#666666]">Data Set</p>
            </div>
          </button>
          {showComingSoon && (
            <div className="absolute top-40 left-20 ease-out duration-500 text-[#BF94F7]">
              Coming Soon
            </div>
          )}
        </div>
      </div>
      <div className="py-10 flex cursor-pointer" onClick={handleLogout}>
        <img src={logoutIcon} alt="" />
        <div className="pl-4">Logout</div>
      </div>
    </div>
  );
}
