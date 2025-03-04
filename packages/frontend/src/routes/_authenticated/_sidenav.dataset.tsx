import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Dataset } from "@backend/db/schemas/datasets";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { readString } from "react-papaparse";
import { removeFileExtension } from "../../utils/helpers";
import SkeletonComponent from "../../components/design-system/components/Skeleton";
import uploadIcon from "/iconupload.svg";
import editIcon from "/iconedit.svg";
import backIcon from "/iconback.svg";
import trashIcon from "/icontrash.png";
import imageDelete from "/imagedelete.png";
import { useQuery } from "@tanstack/react-query";
import {
    getAllDatasetsQueryOptions,
    useCreateDatasetMutation,
} from "@/lib/api/datasets";
import axios from "axios";

export const Route = createFileRoute("/_authenticated/_sidenav/dataset")({
    component: DataSet,
});

function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(find, "g"), replace);
}

function DataSet() {
    const [dataNames, setDataNames] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [datasetIsActive, setDatasetIsActive] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    const { user } = Route.useRouteContext();

    const { data: allDatasets } = useQuery(getAllDatasetsQueryOptions);

    useEffect(() => {
        if (!allDatasets) return;

        const titles = allDatasets.map((dataset) => dataset.title);
        setDataNames(titles);
    }, [allDatasets]);

    const { mutate: createDataset, isPending: isCreateDatasetLoading } =
        useCreateDatasetMutation();

    const handleData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]!;
        const text = await file.text();

        createDataset({
            title: removeFileExtension(file.name),
            content: text,
        });
    };

    const handleClick = (index: number) => {
        setSelectedIndex(index);
        setDatasetIsActive(true);
    };

    function toggleShoWMenu() {
        setShowMenu(!showMenu);
    }

    // async function handleDeleteDataset(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault();
    //     try {
    //         const res = await axios.post(
    //             `/api/v0/datasets/delete/${dataSets[selectedIndex].dataset_id}`
    //         );
    //         if (res.data.success) {
    //             setDeleteMode(false);
    //             setDatasetIsActive(false);
    //         }
    //     } catch (error) {
    //         console.error("Error deleting dataset:", error);
    //     }
    // }

    return (
        <div className="w-full">
            {deleteMode && (
                <div className="fixed z-[201] py-5 px-2 md:px-5 rounded-lg bg-[#1A1A1A] top-[10%] md:left-[35%] flex flex-col">
                    <img src={imageDelete} alt="" />
                    <div className="text-xl py-5 font-bold">
                        Delete For Eternity
                    </div>
                    <div className="">
                        You are about to permanently delete{" "}
                        <span className="text-[#D2B1FD]">
                            {allDatasets && allDatasets[selectedIndex].title}
                        </span>
                        . This <br /> dataset will be gone forever.
                    </div>
                    <div className="mx-auto py-2">
                        <form>
                            <input
                                name="content"
                                id="content"
                                defaultValue="[this message was deleted]"
                                className="hidden"
                            />
                            <div className="flex pl-64">
                                <button
                                    className="hidden md:block md:pb-1 edit-btn cursor-pointer px-5 py-2 md:my-2 mx-2 bg-[#BABABA] rounded hover:bg-[#fafafa] transition-all ease duration-300 text-black tracking-widest"
                                    onClick={() => setDeleteMode(false)}
                                >
                                    CANCEL
                                </button>
                                <button className="hidden md:block delete-btn cursor-pointer px-5 py-2 md:my-2 bg-[#DD4B63] rounded hover:bg-red-600 transition-all ease duration-300 tracking-widest">
                                    DELETE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {deleteMode && (
                <div
                    className="fixed inset-0 bg-black z-[200] opacity-70"
                    onClick={() => setDeleteMode(false)}
                ></div>
            )}
            <div
                className={`px-5 ${datasetIsActive && "border-b border-b-zinc-700"}`}
            >
                {!datasetIsActive && (
                    <div className="flex justify-between pt-5 pr-5">
                        <h2 className="font text-xl">Dataset</h2>
                        <div className="flex rounded bg-[#424242] px-6 py-3 text-white cursor-pointer">
                            <img src={uploadIcon} className="cursor-pointer" />
                            <label
                                htmlFor="fileUpload"
                                className="pl-3 text-sm tracking-widest cursor-pointer w-32"
                            >
                                UPLOAD CSV
                            </label>
                            <input
                                id="fileUpload"
                                type="file"
                                accept=".csv"
                                onChange={handleData}
                                className="hidden"
                            />
                        </div>
                    </div>
                )}
                {datasetIsActive && (
                    <div className="flex justify-between pt-5 pr-5">
                        <div>
                            <div
                                className="flex w-[200px] cursor-pointer"
                                onClick={() => setDatasetIsActive(false)}
                            >
                                <img
                                    src={backIcon}
                                    alt=""
                                    className="w-[15px]"
                                />
                                <div className="pl-2 text-sm">
                                    Back to Dataset
                                </div>
                            </div>
                            <h2 className="font text-2xl pl-7 py-2">
                                {allDatasets &&
                                    allDatasets[selectedIndex].title}
                            </h2>
                        </div>
                        <div className="flex rounded bg-[#424242] text-white cursor-pointer px-7 pt-3 h-[40px]">
                            <img
                                src={editIcon}
                                className="cursor-pointer w-[15px] h-[15px]"
                            />
                            <div
                                className="pl-3 text-sm tracking-widest cursor-pointer"
                                onClick={toggleShoWMenu}
                            >
                                EDIT
                            </div>
                        </div>
                        {showMenu && (
                            <div className="fixed top-[120px] right-[40px] bg-zinc-700 py-5 px-5 rounded hover:cursor-pointer z-50 flex">
                                <img src={trashIcon} className="py-1" />
                                <div
                                    className="pl-2 text-[#D2B1FC] cursor-pointer"
                                    onClick={() => setDeleteMode(true)}
                                >
                                    Delete
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!datasetIsActive && (
                    <div className="flex justify-between py-3">
                        <div className="flex gap-2">
                            {allDatasets && allDatasets.length > 0
                                ? allDatasets
                                      .filter((dataset) => dataset.active)
                                      .map((data, index: number) => (
                                          <div
                                              key={index}
                                              onClick={() => handleClick(index)}
                                              className="px-10 pl-5 py-5 border border-[#505050] rounded-2xl cursor-pointer"
                                          >
                                              <div className="flex">
                                                  <div>
                                                      <div className="flex">
                                                          <svg
                                                              width="16"
                                                              height="18"
                                                              viewBox="0 0 16 18"
                                                              fill="none"
                                                              xmlns="http://www.w3.org/2000/svg"
                                                              className="fill-current text-white"
                                                          >
                                                              <path d="M16 2.8125V4.5C16 6.05391 12.4179 7.3125 8 7.3125C3.58214 7.3125 0 6.05391 0 4.5V2.8125C0 1.25859 3.58214 0 8 0C12.4179 0 16 1.25859 16 2.8125ZM14.0429 7.54805C14.7857 7.28789 15.4679 6.95391 16 6.54258V10.125C16 11.6789 12.4179 12.9375 8 12.9375C3.58214 12.9375 0 11.6789 0 10.125V6.54258C0.532143 6.95742 1.21429 7.28789 1.95714 7.54805C3.56071 8.11055 5.69643 8.4375 8 8.4375C10.3036 8.4375 12.4393 8.11055 14.0429 7.54805ZM0 12.1676C0.532143 12.5824 1.21429 12.9129 1.95714 13.173C3.56071 13.7355 5.69643 14.0625 8 14.0625C10.3036 14.0625 12.4393 13.7355 14.0429 13.173C14.7857 12.9129 15.4679 12.5789 16 12.1676V15.1875C16 16.7414 12.4179 18 8 18C3.58214 18 0 16.7414 0 15.1875V12.1676Z" />
                                                          </svg>
                                                          <div className="pl-2">
                                                              {data.title}
                                                          </div>
                                                      </div>
                                                      <div className="text-[#666666]">
                                                          {data.title}.csv
                                                      </div>
                                                  </div>
                                                  <div className="pl-20 pt-3 text-[#D2B1FD]">
                                                      View Dataset
                                                  </div>
                                              </div>
                                          </div>
                                      ))
                                : null}
                        </div>
                    </div>
                )}
            </div>
            {allDatasets && datasetIsActive && (
                <div className="px-5 py-4">
                    {isCreateDatasetLoading ? (
                        <SkeletonComponent type="table" />
                    ) : (
                        <DataTable dataset={allDatasets[selectedIndex]} />
                    )}
                </div>
            )}
        </div>
    );
}

/*
class JsonParseError {
    readonly _tag = "JsonParseError";
}
*/

function DataTable(props: { dataset: Dataset | undefined }) {
    const [parsedData, setParsedData] = useState<string[][]>();

    useEffect(() => {
        if (props.dataset === undefined) return;
        readString(props.dataset.content, {
            complete: (result) => {
                setParsedData(result.data as string[][]);
            },
        });
    }, [props.dataset]);

    return (
        <Table className="border border-[#303030]">
            {parsedData && (
                <>
                    <TableHeader className="bg-[#303030]">
                        <TableRow className="border-none">
                            {parsedData[0].map((headerTitle, index) => (
                                <TableHead key={index}>{headerTitle}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData &&
                            parsedData.slice(1).map((rows, index) => (
                                <TableRow key={index}>
                                    {rows.map((row, index) => (
                                        <TableCell key={index}>{row}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </>
            )}
        </Table>
    );
}
