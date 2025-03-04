import { FC, useEffect, useState } from "react";
import { RadioButton, RadioButtonItem } from "../../custom-ui/RadioButton";
import { useButtonStore } from "../../../store/useButtonStore";
import { cn } from "../../../lib/utils";
import { useRadioButtonStore } from "../../../store/useRadioButtonStore";

const RadioButtonSection: FC = () => {
    const { radioButtonStyles } = useRadioButtonStore();
    const { setButtonType } = useButtonStore();

    const [isCheckedOptionOne, setIsCheckedOptionOne] = useState(true);

    return (
        <div
            className="w-fit mt-4"
            onClick={() => {
                setButtonType("primary");
            }}
        >
            <div className="flex">
                <RadioButton
                    defaultValue="option-one"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        gap: "40px",
                    }}
                >
                    {/* First Radio Button */}
                    <div className={cn("flex items-center gap-2")}>
                        <RadioButtonItem
                            value="option-one"
                            id="option-one"
                            style={{
                                height: radioButtonStyles.height,
                                width: radioButtonStyles.width,
                                borderColor: radioButtonStyles.borderColor,
                                borderWidth: radioButtonStyles.borderWidth,
                                borderRadius: radioButtonStyles.borderRadius,
                            }}
                            checked={isCheckedOptionOne}
                            customIcon={
                                radioButtonStyles.customIcon ? (
                                    <div
                                        style={{
                                            height: radioButtonStyles.customIcon
                                                .height,
                                            width: radioButtonStyles.customIcon
                                                .width,
                                            backgroundColor:
                                                radioButtonStyles.customIcon
                                                    .backgroundColor,
                                            borderRadius:
                                                radioButtonStyles.customIcon
                                                    .borderRadius,
                                        }}
                                    />
                                ) : null
                            }
                            onChange={() => setIsCheckedOptionOne(true)}
                        />
                    </div>

                    {/* Second Radio Button */}
                    <div className={cn("flex items-center gap-2")}>
                        <RadioButtonItem
                            value="option-two"
                            id="option-two"
                            style={{
                                height: radioButtonStyles.height,
                                width: radioButtonStyles.width,
                                borderColor: radioButtonStyles.borderColor,
                                borderWidth: radioButtonStyles.borderWidth,
                                borderRadius: radioButtonStyles.borderRadius,
                                color: radioButtonStyles.color,
                            }}
                            checked={!isCheckedOptionOne}
                            customIcon={
                                radioButtonStyles.customIcon ? (
                                    <div
                                        style={{
                                            height: radioButtonStyles.customIcon
                                                .height,
                                            width: radioButtonStyles.customIcon
                                                .width,
                                            backgroundColor:
                                                radioButtonStyles.customIcon
                                                    .backgroundColor,
                                            borderRadius:
                                                radioButtonStyles.customIcon
                                                    .borderRadius,
                                        }}
                                    />
                                ) : null
                            }
                            onChange={() => setIsCheckedOptionOne(false)}
                        />
                    </div>
                </RadioButton>
            </div>
        </div>
    );
};

export default RadioButtonSection;
