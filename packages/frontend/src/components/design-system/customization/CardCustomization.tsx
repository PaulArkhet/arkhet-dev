import { useCardStore } from "../../../store/useCardStore";
import { capitalizeText } from "../../../utils/helpers";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { HexColorPicker } from "react-colorful";
import { Badge } from "../../ui/badge";
import Divider from "../components/Divider";

export default function CardCustomization() {
    const { cardStyles, setCardStyles } = useCardStore();

    const [cardColor, setCardColor] = useState(cardStyles.backgroundColor);
    const [cardBorderRadius, setCardBorderRadius] = useState(
        parseInt(cardStyles.borderRadius)
    );
    const [border, setBorder] = useState(!cardStyles.border.includes("0px"));
    const [borderColor, setBorderColor] = useState(
        cardStyles.border.split(" ").pop() || "#000000"
    );
    const [buttonColor, setButtonColor] = useState(cardStyles.color);
    const [listColor, setListColor] = useState(cardStyles.list.backgroundColor);
    const [showAvatar, setShowAvatar] = useState(cardStyles.list.showAvatar);
    const [showCheckbox, setShowCheckbox] = useState(
        cardStyles.list.showCheckbox
    );

    useEffect(() => {
        setCardStyles({
            ...cardStyles,
            backgroundColor: cardColor,
            borderRadius: `${cardBorderRadius}px`,
            border: border
                ? `1px solid ${borderColor}`
                : "0px solid transparent",
            color: buttonColor,
            list: {
                ...cardStyles.list,
                backgroundColor: listColor,
                showAvatar,
                showCheckbox,
            },
        });
    }, [
        cardColor,
        cardBorderRadius,
        borderColor,
        border,
        buttonColor,
        listColor,
        showAvatar,
        showCheckbox,
    ]);

    const borderHandler = () => {
        setBorder((prevBorder) => {
            const newBorder = !prevBorder;

            setCardStyles({
                ...setCardStyles,
                border: newBorder ? `1px solid` : "0px solid",
            });

            return newBorder;
        });
    };

    return (
        <>
            <div className="h-40" />
            <div className="customization-panel-styling text-sm mt-96 gap-4 flex flex-col">
                <h1 className="pb-3 font-semibold">Cards</h1>
                <div className="space-y-2">
                    <p className="text-sm font-semibold w-full text-left">
                        <span className="font-normal">Card Color: </span>
                        {capitalizeText(cardColor)}
                    </p>
                    <Popover>
                        <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{
                                    backgroundColor: cardColor,
                                }}
                            />
                            <span className="text-white font-mono">
                                {cardColor}
                            </span>
                        </PopoverTrigger>
                        <PopoverContent className="bg-zinc-950 w-fit h-fit">
                            <HexColorPicker
                                color={cardColor}
                                onChange={setCardColor}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-semibold">
                        Border Radius: {cardBorderRadius}px
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: "None", value: 0 },
                            { label: "Small", value: 5 },
                            { label: "Medium", value: 10 },
                            { label: "Large", value: 15 },
                            { label: "Extra", value: 20 },
                        ].map(({ label, value }) => (
                            <Badge
                                key={value}
                                onClick={() => setCardBorderRadius(value)}
                                className={`cursor-pointer hover:bg-gray-600 ${
                                    cardBorderRadius === value
                                        ? "bg-gray-700 text-white"
                                        : "bg-gray-200 text-black"
                                }`}
                            >
                                {label} ({value}px)
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex gap-x-2">
                    <p>Border: </p>
                    <Badge
                        onClick={() => {
                            borderHandler();
                        }}
                        className={`${
                            border
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-black"
                        } cursor-pointer hover:bg-gray-600 w-fit`}
                    >
                        {border ? "OFF" : "ON"}
                    </Badge>
                </div>
                {border && (
                    <div className="grid gap-2">
                        <p className="text-sm font-semibold w-full text-left">
                            <span className="font-normal">Border Color: </span>
                            {capitalizeText(borderColor)}
                        </p>
                        <Popover>
                            <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                                <div
                                    className="w-4 h-4 rounded-sm"
                                    style={{
                                        borderColor,
                                    }}
                                />
                                <span className="text-white font-mono">
                                    {borderColor}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="bg-zinc-950 w-fit h-fit">
                                <HexColorPicker
                                    color={borderColor}
                                    onChange={setBorderColor}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-sm font-semibold w-full text-left">
                        <span className="font-normal">Button Color: </span>
                        {capitalizeText(buttonColor)}
                    </p>
                    <Popover>
                        <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{
                                    backgroundColor: buttonColor,
                                }}
                            />
                            <span className="text-white font-mono">
                                {buttonColor}
                            </span>
                        </PopoverTrigger>
                        <PopoverContent className="bg-zinc-950 w-fit h-fit">
                            <HexColorPicker
                                color={buttonColor}
                                onChange={setButtonColor}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Divider />
            <div className="customization-panel-styling text-sm  gap-4 flex flex-col">
                <h1 className="pb-3 font-semibold">Lists</h1>
                <div className="space-y-2">
                    <p className="text-sm font-semibold w-full text-left">
                        <span className="font-normal">List Color: </span>
                        {capitalizeText(listColor)}
                    </p>
                    <Popover>
                        <PopoverTrigger className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{
                                    backgroundColor: listColor,
                                }}
                            />
                            <span className="text-white font-mono">
                                {listColor}
                            </span>
                        </PopoverTrigger>
                        <PopoverContent className="bg-zinc-950 w-fit h-fit">
                            <HexColorPicker
                                color={listColor}
                                onChange={setListColor}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex gap-x-2">
                    <p>Show Avatar: </p>
                    <Badge
                        onClick={() => {
                            setShowAvatar((prev) => !prev);
                        }}
                        className={`${
                            showAvatar
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-black"
                        } cursor-pointer hover:bg-gray-600 w-fit`}
                    >
                        {showAvatar ? "OFF" : "ON"}
                    </Badge>
                </div>
                <div className="flex gap-x-2">
                    <p>Show CheckBox: </p>
                    <Badge
                        onClick={() => {
                            setShowCheckbox((prev) => !prev);
                        }}
                        className={`${
                            showCheckbox
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-black"
                        } cursor-pointer hover:bg-gray-600 w-fit`}
                    >
                        {showCheckbox ? "OFF" : "ON"}
                    </Badge>
                </div>
            </div>
        </>
    );
}
