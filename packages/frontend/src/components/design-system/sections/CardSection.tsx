import { useCardStore } from "../../../store/useCardStore";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../custom-ui/Card";

import sampleImage from "/sampleImage.png";
import sampleImageSmall from "/sampleImageSmall.png";
import { Checkbox } from "../../custom-ui/CheckBox";
import { FC, useState } from "react";

type HoverStates = {
    mainCard: boolean;
    subCard: boolean;
    mediumCard: boolean;
    listCard1: boolean;
    listCard2: boolean;
    listCard3: boolean;
    listCard4: boolean;
    listCard5: boolean;
};

const CardSection: FC = () => {
    const { cardStyles } = useCardStore();

    const [hoverStates, setHoverStates] = useState<HoverStates>({
        mainCard: false,
        subCard: false,
        mediumCard: false,
        listCard1: false,
        listCard2: false,
        listCard3: false,
        listCard4: false,
        listCard5: false,
    });

    const handleMouseEnter = (key: keyof HoverStates) => {
        setHoverStates((prev) => ({ ...prev, [key]: true }));
    };

    const handleMouseLeave = (key: keyof HoverStates) => {
        setHoverStates((prev) => ({ ...prev, [key]: false }));
    };

    return (
        <div className="flex gap-3 items-start">
            {/* Main Card */}
            {/* <Card
                className="w-60 h-auto text-white shadow-md border-none"
                style={{
                    ...cardStyles,
                    backgroundColor: hoverStates.mainCard
                        ? cardStyles.hoveredBackgroundColor
                        : cardStyles.backgroundColor,
                }}
                onMouseEnter={() => handleMouseEnter("mainCard")}
                onMouseLeave={() => handleMouseLeave("mainCard")}
            >
                <CardHeader className="flex flex-row px-4 py-3 justify-between">
                    <div className="flex gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm"
                            style={{
                                backgroundColor: cardStyles.color,
                            }}
                        >
                            A
                        </div>
                        <div style={{ color: cardStyles.textColor }}>
                            <CardTitle className="text-sm">Header</CardTitle>
                            <CardDescription className="text-xs text-gray-400">
                                Subhead
                            </CardDescription>
                        </div>
                    </div>
                    {cardStyles.mainCard.button && (
                        <div className="flex flex-col text-gray-400 cursor-pointer -mt-2">
                            <p className="leading-none -mb-2">•</p>
                            <p className="leading-none -mb-2">•</p>
                            <p className="leading-none">•</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col p-0 pt-1">
                    {cardStyles.mainCard.picture && (
                        <img
                            src={sampleImage}
                            alt="Sample Image"
                            className="w-full object-cover"
                        />
                    )}

                    <div
                        className="p-3"
                        style={{ color: cardStyles.textColor }}
                    >
                        <CardTitle className="text-sm">Title</CardTitle>
                        <CardDescription className="text-xs">
                            Subhead
                        </CardDescription>
                        <div className="flex justify-center items-center h-full">
                            <CardDescription className="py-2 text-xs">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor.
                            </CardDescription>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 px-4 py-4">
                    <button
                        className="px-3 py-2 rounded-full bg-zinc-900 border border-white text-xs"
                        style={{ color: cardStyles.color }}
                    >
                        Enabled
                    </button>
                    <button
                        className="px-3 py-2 rounded-full text-black text-xs"
                        style={{ backgroundColor: cardStyles.color }}
                    >
                        Enabled
                    </button>
                </CardFooter>
            </Card> */}

            {/* Sub Card */}
            <div className="flex gap-3 flex-col">
                <Card
                    className="w-56 h-16 text-white rounded-xl shadow-md border-none overflow-hidden"
                    style={{
                        ...cardStyles,
                        backgroundColor: hoverStates[
                            `subCard` as keyof HoverStates
                        ]
                            ? cardStyles.hoveredBackgroundColor
                            : cardStyles.backgroundColor,
                    }}
                    onMouseEnter={() =>
                        handleMouseEnter(`subCard` as keyof HoverStates)
                    }
                    onMouseLeave={() =>
                        handleMouseLeave(`v` as keyof HoverStates)
                    }
                >
                    <CardHeader className="flex flex-row justify-evenly w-full h-full p-0">
                        <div className="flex items-center w-full h-full">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold mx-3 text-sm"
                                style={{
                                    backgroundColor: cardStyles.color,
                                }}
                            >
                                A
                            </div>
                            <div
                                className="flex-1"
                                style={{ color: cardStyles.textColor }}
                            >
                                <CardTitle className="text-sm">
                                    Header
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-400">
                                    Subhead
                                </CardDescription>
                            </div>
                            {cardStyles.subCard.picture && (
                                <div className="flex items-center justify-center text-black font-bold">
                                    <img
                                        src={sampleImageSmall}
                                        alt="Sample Image"
                                        className="w-full h-full"
                                    />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* List Cards */}
                <Card
                    className="w-60 h-16 text-white shadow-md  border-none rounded-none overflow-hidden self-start"
                    style={{
                        ...cardStyles,
                        borderRadius: cardStyles.listCard.borderRadius,
                        backgroundColor: hoverStates.listCard1
                            ? cardStyles.hoveredBackgroundColor
                            : cardStyles.backgroundColor,
                    }}
                    onMouseEnter={() => handleMouseEnter("listCard1")}
                    onMouseLeave={() => handleMouseLeave("listCard1")}
                >
                    <CardHeader className="flex flex-row items-center justify-between w-full h-full p-4 gap-3 rounded-none">
                        <div className="flex flex-col justify-center">
                            <CardTitle className="text-sm font-semibold">
                                List item
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-400">
                                Supporting line text lorem ipsum dolor sit amet,
                                consectetur.
                            </CardDescription>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6 ">
                            <Checkbox
                                className="bg-transparent data-[state=checked]:border-0 border-2 border-[#DEE3E5] h-5 w-5 data-[state=checked]:text-[#412D00] data-[state=checked]:bg-[#ECC06C]"
                                checked
                            />
                        </div>
                    </CardHeader>
                </Card>
                {/* <Card
                className="w-60 h-16 text-white rounded-none shadow-md border-none overflow-hidden self-start"
                style={{
                    ...cardStyles,
                    borderRadius: cardStyles.listCard.borderRadius,
                    backgroundColor: hoverStates.listCard2
                        ? cardStyles.hoveredBackgroundColor
                        : cardStyles.backgroundColor,
                }}
                onMouseEnter={() => handleMouseEnter("listCard2")}
                onMouseLeave={() => handleMouseLeave("listCard2")}
            >
                <CardHeader className="flex flex-row items-center justify-between w-full h-full p-4 gap-3">
                    <div className="flex flex-col justify-center">
                        <CardTitle className="text-sm font-semibold">
                            List item
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                            Supporting line text lorem ipsum dolor sit amet,
                            consectetur.
                        </CardDescription>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6 "></div>
                </CardHeader>
            </Card>
            <Card
                className="w-60 h-16 text-white rounded-none shadow-md bg-[#171D1E] border-none overflow-hidden self-start"
                style={{
                    ...cardStyles,
                    borderRadius: cardStyles.listCard.borderRadius,
                    backgroundColor: hoverStates.listCard3
                        ? cardStyles.hoveredBackgroundColor
                        : cardStyles.backgroundColor,
                }}
                onMouseEnter={() => handleMouseEnter("listCard3")}
                onMouseLeave={() => handleMouseLeave("listCard3")}
            >
                <CardHeader className="flex flex-row items-center w-full h-full gap-3 p-2">
                    <div className="pl-1">
                        <div className="flex w-7 h-7 rounded-full bg-[#5C451C] items-center justify-center text-white font-bold text-sm">
                            A
                        </div>
                    </div>

                    <div className="flex-1 flex-col justify-center pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-200">
                            List item
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                            Supporting line text lorem ipsum dolor sit amet,
                            consectetur.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card
                className="w-60 h-16 text-white rounded-none shadow-md bg-[#171D1E] border-none overflow-hidden self-start"
                style={{
                    ...cardStyles,
                    borderRadius: cardStyles.listCard.borderRadius,
                    backgroundColor: hoverStates.listCard4
                        ? cardStyles.hoveredBackgroundColor
                        : cardStyles.backgroundColor,
                }}
                onMouseEnter={() => handleMouseEnter("listCard4")}
                onMouseLeave={() => handleMouseLeave("listCard4")}
            >
                <CardHeader className="flex flex-row items-center w-full h-full gap-3 p-2">
                    <div className="flex w-8 h-8 rounded-full items-center justify-center text-white font-bold">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8ZM18 17C17.8 16.29 14.7 15 12 15C9.3 15 6.2 16.29 6 17.01V18H18V17ZM4 17C4 14.34 9.33 13 12 13C14.67 13 20 14.34 20 17V20H4V17Z"
                                fill="#C2C8BC"
                            />
                        </svg>
                    </div>
                    <div className="flex-1 flex-col justify-center pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-200">
                            List item
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                            Supporting line text lorem ipsum dolor sit amet,
                            consectetur.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card
                className="w-60 h-16 text-white rounded-none shadow-md bg-[#171D1E] border-none overflow-hidden self-start"
                style={{
                    ...cardStyles,
                    borderRadius: cardStyles.listCard.borderRadius,
                    backgroundColor: hoverStates.listCard5
                        ? cardStyles.hoveredBackgroundColor
                        : cardStyles.backgroundColor,
                }}
                onMouseEnter={() => handleMouseEnter("listCard5")}
                onMouseLeave={() => handleMouseLeave("listCard5")}
                id="list"
            >
                <CardHeader className="flex flex-row items-center w-full h-full gap-3 p-2">
                    <div className="flex w-7 h-7 rounded-full items-center justify-center text-white font-bold">
                        <div className="flex items-center justify-center text-black font-bold">
                            <img
                                src={sampleImageSmall}
                                alt="Sample Image"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                    <div className="flex-1 flex-col justify-center pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-200">
                            List item
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                            Supporting line text lorem ipsum dolor sit amet,
                            consectetur.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card> */}
                {/* Medium Card */}
                <Card
                    className="w-52 h-min text-white rounded-xl shadow-md border-none overflow-hidden self-start"
                    style={{
                        ...cardStyles,
                        backgroundColor: hoverStates.mediumCard
                            ? cardStyles.hoveredBackgroundColor
                            : cardStyles.backgroundColor,
                    }}
                    onMouseEnter={() => handleMouseEnter("mediumCard")}
                    onMouseLeave={() => handleMouseLeave("mediumCard")}
                >
                    <CardHeader className="p-4">
                        <CardTitle
                            className="text-md font-semibold"
                            style={{ color: cardStyles.textColor }}
                        >
                            Basic dialog title
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-400 mt-1">
                            A dialog is a type of modal window that appears in
                            front of app content to provide critical
                            information, or prompt for a decision to be made.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter
                        className="flex justify-end px-1 py-1"
                        style={{ color: cardStyles.color }}
                    >
                        <button className="px-4 py-2 text-xs font-medium rounded-md bg-transparent ">
                            Action 2
                        </button>
                        <button className="px-4 py-2 text-xs font-medium rounded-md  ">
                            Action 1
                        </button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default CardSection;
