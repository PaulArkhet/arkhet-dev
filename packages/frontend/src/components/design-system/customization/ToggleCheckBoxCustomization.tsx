import { Badge } from "../../ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useCheckBoxStore } from "../../../store/useCheckBoxStore";
import { useToggleStore } from "../../../store/useToggleStore";
import { useEffect, useState } from "react";
import CheckIcons, { checkIconNames } from "../components/CheckIcons";

export default function ToggleCheckBoxCustomization() {
    const { toggleStyling, setToggleStyling } = useToggleStore();
    const {
        checkBoxStyling,
        setCheckBoxStyling,
        checkBoxCustomIcon,
        setCheckBoxCustomIcon,
    } = useCheckBoxStore();

    const [toggleBorderRadius, setToggleBorderRadius] = useState(
        toggleStyling.borderRadius
    );
    const [checkBoxBorderRadius, setCheckBoxBorderRadius] = useState(
        checkBoxStyling.checkboxBaseStyles.borderRadius
    );
    const [CustomIcon, setCustomIcon] = useState<checkIconNames>("Straight");

    useEffect(() => {
        setToggleStyling({
            ...toggleStyling,
            borderRadius: toggleBorderRadius,
        });
    }, [toggleBorderRadius]);

    useEffect(() => {
        setCheckBoxStyling({
            ...checkBoxStyling,
            checkboxBaseStyles: {
                ...checkBoxStyling.checkboxBaseStyles,
                borderRadius: checkBoxBorderRadius,
            },
        });
    }, [checkBoxBorderRadius]);

    return (
        <div className="customization-panel-styling text-sm mt-44">
            <h1 className="pb-3 font-semibold">Check Boxes</h1>
            <div className="grid gap-2">
                <h2>Border Radius: {checkBoxBorderRadius}</h2>
                <div className="flex flex-wrap gap-2 ">
                    {[
                        { label: "None", value: 0 },
                        { label: "Small", value: 5 },
                        { label: "Medium", value: 10 },
                        { label: "Large", value: 15 },
                        { label: "Extra", value: 20 },
                    ].map(({ label, value }) => (
                        <Badge
                            key={value}
                            onClick={() => {
                                setCheckBoxBorderRadius(`${value}px`);
                            }}
                            className={`cursor-pointer hover:bg-gray-600 ${
                                checkBoxBorderRadius === `${value}px`
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-200 text-black"
                            }`}
                        >
                            {label} ({value}px)
                        </Badge>
                    ))}
                </div>
            </div>
            <div className="flex flex-row gap-x-1">
                <h2>Custom Check Icon: </h2>
                <DropdownMenu>
                    <DropdownMenuTrigger className="font-bold">
                        {CustomIcon}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-max bg-zinc-950 text-white rounded-xl">
                        {Object.keys(CheckIcons).map((value, index) => {
                            return (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => {
                                        setCustomIcon(value as checkIconNames);
                                        setCheckBoxCustomIcon(
                                            value as checkIconNames
                                        );
                                    }}
                                >
                                    {value}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center py-5">
                <hr className="flex-grow border-t border-gray-500" />
            </div>
            <h1 className="pb-3 font-semibold">Toggle Button</h1>
            <div className="grid gap-2">
                <h2>Border Radius: {toggleBorderRadius}</h2>
                <div className="flex flex-wrap gap-2 ">
                    {[
                        { label: "None", value: 0 },
                        { label: "Small", value: 5 },
                        { label: "Medium", value: 10 },
                        { label: "Large", value: 15 },
                        { label: "Extra", value: 20 },
                    ].map(({ label, value }) => (
                        <Badge
                            key={value}
                            onClick={() => {
                                setToggleBorderRadius(`${value}px`);
                            }}
                            className={`cursor-pointer hover:bg-gray-600 ${
                                toggleBorderRadius === `${value}px`
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-200 text-black"
                            }`}
                        >
                            {label} ({value}px)
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
