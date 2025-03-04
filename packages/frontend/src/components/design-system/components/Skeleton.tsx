import { Skeleton } from "../../ui/skeleton";

interface SkeletonComponentProps {
    type:
        | "typography"
        | "color"
        | "button"
        | "radioButton"
        | "textField"
        | "internalNavigation"
        | "segmentedButton"
        | "checkbox"
        | "card"
        | "list"
        | "toggle"
        | "table"
        | "grid";
}

export default function SkeletonComponent({ type }: SkeletonComponentProps) {
    if (type === "color") {
        return (
            <>
                <Skeleton className="w-full h-[48px] rounded-lg mt-4" />
                <div className="flex gap-4 mt-4">
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                </div>
            </>
        );
    }

    if (type === "typography") {
        return (
            <>
                <Skeleton className="w-full h-[48px] rounded-lg mt-4" />
                <div className="flex gap-4 mt-4">
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                    <Skeleton className="w-1/3 h-[48px] rounded-lg" />
                </div>
                <div className="flex gap-4 mt-4">
                    <Skeleton className="w-full h-[200px] rounded-md" />
                </div>
            </>
        );
    }

    if (type === "button") {
        return <Skeleton className="w-[400px] h-[50px] rounded-lg mt-4" />;
    }

    if (type === "radioButton" || type === "toggle") {
        return <Skeleton className="w-[120px] h-[50px] rounded-lg mt-4" />;
    }

    if (type === "textField" || type === "checkbox") {
        return <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />;
    }

    if (type === "segmentedButton" || type === "internalNavigation") {
        return <Skeleton className="w-[300px] h-[50px] rounded-lg mt-4" />;
    }

    if (type === "table") {
        return (
            <>
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
                <Skeleton className="w-full h-[50px] rounded-lg mt-4" />
            </>
        );
    }

    if (type === "card") {
        return (
            <div className="flex flex-wrap gap-3 items-start w-full">
                <Skeleton className="w-60 h-[300px] rounded-lg mt-4" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-56 h-[60px] rounded-lg mt-4" />
                    <Skeleton className="w-56 h-[60px] rounded-lg mt-4" />
                    <Skeleton className="w-w-52 h-[130px] rounded-lg mt-4" />
                </div>
                <div>
                    <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />
                    <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />
                    <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />
                    <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />
                    <Skeleton className="w-[200px] h-[50px] rounded-lg mt-4" />
                </div>
            </div>
        );
    }

    if (type === "grid") {
        const skeletonCount = 8;
        return (
            <div className="px-5 pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative w-full">
                {Array.from({ length: skeletonCount }, (_, index) => (
                    <Skeleton
                        key={index}
                        className="w-full h-[13.5rem] rounded-lg mt-4"
                    />
                ))}
            </div>
        );
    }

    return null;
}
