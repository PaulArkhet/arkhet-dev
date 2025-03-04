import { Badge } from "../../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useInternalNavigationStore } from "../../../store/useInternalNavigationStore";
import { capitalizeText } from "../../../utils/helpers";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import Divider from "../components/Divider";
import { useSegmentedButtonStore } from "../../../store/useSegmentedButtonStore";

export default function NavigationCustomization() {
    const { InternalNavigationStyles, setInternalNavigationStyles } =
        useInternalNavigationStore();
    const { SegmentedButtonStyles, setSegmentedButtonStyles } =
        useSegmentedButtonStore();

    const [activeInternalNavigationColor, setActiveInternalNavigationColor] =
        useState<string>(InternalNavigationStyles.active.color);
    const [activeSegmentedButtonColor, setActiveSegmentedButtonColor] =
        useState<string>(SegmentedButtonStyles.activeBgColor);
    const [underline, setUnderline] = useState(
        InternalNavigationStyles.active.borderBottom !== "0px"
    );

    const internalNavigationColorChangeHandler = (newHex: string) => {
        setActiveInternalNavigationColor(newHex);
        setInternalNavigationStyles(
            { ...InternalNavigationStyles.internal },
            {
                ...InternalNavigationStyles.active,
                color: newHex,
                borderBottom: underline ? `4px solid ${newHex}` : "0px",
            }
        );
    };

    const segmentedButtonColorChangeHandler = (newHex: string) => {
        setActiveSegmentedButtonColor(newHex);
        setSegmentedButtonStyles({
            ...SegmentedButtonStyles,
            activeBgColor: newHex,
        });
    };

    const underlineHandler = () => {
        setUnderline((prevUnderline) => {
            const newUnderline = !prevUnderline;

            setInternalNavigationStyles(
                { ...InternalNavigationStyles.internal },
                {
                    ...InternalNavigationStyles.active,
                    borderBottom: newUnderline
                        ? `4px solid ${activeInternalNavigationColor}`
                        : "0px",
                }
            );

            return newUnderline;
        });
    };

    return (
        <div className="customization-panel-styling text-sm mt-80">
            <h1 className="pb-3 font-semibold">Internal Navigation</h1>
            <p className="text-sm font-semibold w-full text-left">
                <span className="font-normal">Active Color: </span>
                {capitalizeText(activeInternalNavigationColor)}
            </p>
            <Popover>
                <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                    <div
                        className="w-4 h-4 rounded-sm"
                        style={{
                            backgroundColor: activeInternalNavigationColor,
                        }}
                    />
                    <span className="text-white font-mono">
                        {activeInternalNavigationColor}
                    </span>
                </PopoverTrigger>
                <PopoverContent className="bg-zinc-950 w-fit h-fit">
                    <HexColorPicker
                        color={activeInternalNavigationColor}
                        onChange={(newHex: string) => {
                            internalNavigationColorChangeHandler(newHex);
                        }}
                    />
                </PopoverContent>
            </Popover>
            <div className="flex gap-x-2">
                <p>Underline: </p>
                <Badge
                    onClick={() => {
                        underlineHandler();
                    }}
                    className={`${
                        underline
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-black"
                    } cursor-pointer hover:bg-gray-600 w-fit`}
                >
                    {underline ? "OFF" : "ON"}
                </Badge>
            </div>
            <Divider />
            <h1 className="pb-3 font-semibold">Segmented Button</h1>
            <p className="text-sm font-semibold w-full text-left">
                <span className="font-normal">Active Color: </span>
                {capitalizeText(activeSegmentedButtonColor)}
            </p>
            <Popover>
                <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                    <div
                        className="w-4 h-4 rounded-sm"
                        style={{
                            backgroundColor: activeSegmentedButtonColor,
                        }}
                    />
                    <span className="text-white font-mono">
                        {activeSegmentedButtonColor}
                    </span>
                </PopoverTrigger>
                <PopoverContent className="bg-zinc-950 w-fit h-fit">
                    <HexColorPicker
                        color={InternalNavigationStyles.active.color}
                        onChange={(newHex: string) => {
                            segmentedButtonColorChangeHandler(newHex);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
