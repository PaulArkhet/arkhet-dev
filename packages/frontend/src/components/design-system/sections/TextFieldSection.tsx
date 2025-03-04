import { useTextFieldStore } from "../../../store/useTextFieldStore";
import { Input } from "../../custom-ui/Input";
import { FC } from "react";

const TextFieldSection: FC = () => {
    const { setCustomizationTextField, textFieldStyling } = useTextFieldStore();

    return (
        <div
            className="flex flex-row gap-5"
            onClick={() => {
                setCustomizationTextField(true);
            }}
        >
            <Input
                label="Label"
                placeholder="Input"
                clearable={textFieldStyling.inputStyle.clearable}
                style={{ ...textFieldStyling.inputStyle }}
                labelClassName={{ ...textFieldStyling.labelStyle }}
            />
            <Input
                label="Label"
                supportingText="Supporting Text"
                placeholder="Input"
                clearable={textFieldStyling.inputStyle.clearable}
                style={{
                    ...textFieldStyling.inputStyle,
                    borderColor: textFieldStyling.inputStyle.borderColorChecked,
                }}
                labelClassName={{
                    ...textFieldStyling.labelStyle,
                    color:
                        textFieldStyling.labelStyle.color !== "transparent"
                            ? textFieldStyling.inputStyle.borderColorChecked
                            : textFieldStyling.labelStyle.color,
                }}
                supportingTextClassName={{
                    ...textFieldStyling.supportingTextStyle,
                }}
            />
        </div>
    );
};

export default TextFieldSection;
