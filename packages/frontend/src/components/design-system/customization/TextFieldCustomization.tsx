import { Badge } from "../../ui/badge";
import { Slider } from "../../ui/slider";
import { useTextFieldStore } from "../../../store/useTextFieldStore";
import { removePx } from "../../../utils/helpers";
import { useEffect, useState } from "react";

export default function TextFieldCustomization() {
    const { textFieldStyling, setTextFieldStyling } = useTextFieldStore();

    const [borderRadius, setBorderRadius] = useState(
        textFieldStyling.inputStyle.borderRadius
    );
    const [borderWidth, setBorderWidth] = useState(
        textFieldStyling.inputStyle.borderWidth
    );
    const [selectedLabelBadge, setSelectedLabelBage] = useState<string>("");

    useEffect(() => {
        setTextFieldStyling({
            inputStyle: {
                ...textFieldStyling.inputStyle,
                borderRadius,
                borderWidth,
            },
        });
    }, [borderRadius, borderWidth]);

    const labelStylingBadgeHandler = (labelStyle: string) => {
        setSelectedLabelBage(labelStyle);
        setTextFieldStyling({
            labelStyle: {
                ...textFieldStyling.labelStyle,
                marginLeft: labelStyle.includes("Center")
                    ? "45px"
                    : labelStyle.includes("Right")
                    ? "90px"
                    : "1px",
                marginTop: labelStyle.includes("Above") ? "-25px" : "-10px",
                backgroundColor: labelStyle.includes("Inline")
                    ? "#27272a"
                    : textFieldStyling.labelStyle.backgroundColor,
            },
        });
    };

    return (
        <div className="customization-panel-styling text-sm mt-96">
            <div className="grid gap-3">
                <h1 className="pb-3">Input Field</h1>
                <Badge
                    onClick={() => {
                        setTextFieldStyling({
                            inputStyle: {
                                ...textFieldStyling.inputStyle,
                                clearable:
                                    !textFieldStyling.inputStyle.clearable,
                            },
                        });
                    }}
                    className={`${
                        textFieldStyling.inputStyle.clearable
                            ? "bg-gray-700 text-white"
                            : " bg-gray-200 text-black"
                    } cursor-pointer hover:bg-gray-600 w-fit`}
                >
                    Add Clearable Button
                </Badge>
                {textFieldStyling.labelStyle.color !== "transparent" ? (
                    <div className="grid gap-2">
                        <h2>Label Styling</h2>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Above Left",
                                "Above Center",
                                "Above Right",
                                "Inline Left",
                                "Inline Center",
                                "Inline Right",
                            ].map((labelStyle) => (
                                <Badge
                                    key={labelStyle}
                                    className={`${
                                        selectedLabelBadge === labelStyle
                                            ? "bg-gray-700 text-white"
                                            : " bg-gray-200 text-black"
                                    } cursor-pointer hover:bg-gray-600 w-fit`}
                                    onClick={() =>
                                        labelStylingBadgeHandler(labelStyle)
                                    }
                                >
                                    {labelStyle}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="grid gap-2">
                    <h2>Border Radius: {borderRadius}</h2>
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
                                    setBorderRadius(`${value}px`);
                                }}
                                className={`cursor-pointer hover:bg-gray-600 ${
                                    borderRadius === `${value}px`
                                        ? "bg-gray-700 text-white"
                                        : "bg-gray-200 text-black"
                                }`}
                            >
                                {label} ({value}px)
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="grid gap-2">
                    <h2>Border Width: {borderWidth}</h2>
                    <Slider
                        value={[removePx(borderWidth)]}
                        min={0}
                        max={5}
                        step={1}
                        onValueChange={(value) => {
                            setBorderWidth(`${value[0]}px`);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
