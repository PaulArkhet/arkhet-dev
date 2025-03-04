import { useState } from "react";
import {
    SegmentedButtonStyleConfig,
    useSegmentedButtonStore,
} from "../../store/useSegmentedButtonStore";

export default function SegmentedButton(
    props: Partial<SegmentedButtonStyleConfig>
) {
    const { SegmentedButtonStyles } = useSegmentedButtonStore();
    const [selectedButton, setSelectedButton] = useState<number | null>(null);

    const getBorderRadiusStyle = (index: number) => {
        if (index === 0) {
            return { borderRadius: "9999px 0 0 9999px" };
        } else if (index === SegmentedButtonStyles.buttonLabels.length - 1) {
            return { borderRadius: "0 9999px 9999px 0" };
        }
        return {};
    };

    return (
        <section style={{ display: "flex" }}>
            {SegmentedButtonStyles.buttonLabels.map((label, index) => (
                <div key={index}>
                    <input
                        type="radio"
                        name="numbers"
                        value={label}
                        id={label}
                        style={{ display: "none" }}
                        checked={selectedButton === index}
                        readOnly
                    />
                    <label
                        htmlFor={label}
                        style={{
                            display: "inline-block",
                            cursor: "pointer",
                            padding: "12px 32px",
                            fontSize: "12px",
                            transition:
                                "background-color 0.3s, box-shadow 0.3s",
                            border: `1px solid ${SegmentedButtonStyles.borderColor}`,
                            backgroundColor:
                                selectedButton === index
                                    ? SegmentedButtonStyles.activeBgColor
                                    : SegmentedButtonStyles.inactiveBgColor,
                            color:
                                selectedButton === index
                                    ? SegmentedButtonStyles.activeTextColor
                                    : SegmentedButtonStyles.inactiveTextColor,
                            ...getBorderRadiusStyle(index),
                        }}
                        onMouseEnter={(e) => {
                            if (selectedButton !== index) {
                                (
                                    e.target as HTMLLabelElement
                                ).style.backgroundColor =
                                    SegmentedButtonStyles.hoverBgColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedButton !== index) {
                                (
                                    e.target as HTMLLabelElement
                                ).style.backgroundColor =
                                    SegmentedButtonStyles.inactiveBgColor;
                            }
                        }}
                        onClick={() => setSelectedButton(index)}
                    >
                        {label}
                    </label>
                </div>
            ))}
        </section>
    );
}
