import { useToggleStore } from "../../../store/useToggleStore";
import { Toggle } from "../../custom-ui/Toggle";
import { FC, useEffect } from "react";

const ToggleSection: FC = () => {
    const { toggleStyling } = useToggleStore();

    return (
        <div className="flex flex-row gap-5 pr-3">
            <Toggle
                isChecked={toggleStyling.isChecked}
                checkedBackgroundColor={toggleStyling.checkedBackgroundColor}
                uncheckedBackgroundColor={
                    toggleStyling.uncheckedBackgroundColor
                }
                checkedButtonColor={toggleStyling.checkedButtonColor}
                uncheckedButtonColor={toggleStyling.uncheckedButtonColor}
                checkedBorderColor={toggleStyling.checkedBorderColor}
                uncheckedBorderColor={toggleStyling.uncheckedBorderColor}
                checkedThumbSize={toggleStyling.checkedThumbSize}
                uncheckedThumbSize={toggleStyling.uncheckedThumbSize}
                style={toggleStyling.style}
                borderRadius={toggleStyling.borderRadius}
            />
            <Toggle
                isChecked={!toggleStyling.isChecked}
                checkedBackgroundColor={toggleStyling.checkedBackgroundColor}
                uncheckedBackgroundColor={
                    toggleStyling.uncheckedBackgroundColor
                }
                checkedButtonColor={toggleStyling.checkedButtonColor}
                uncheckedButtonColor={toggleStyling.uncheckedButtonColor}
                checkedBorderColor={toggleStyling.checkedBorderColor}
                uncheckedBorderColor={toggleStyling.uncheckedBorderColor}
                checkedThumbSize={toggleStyling.checkedThumbSize}
                uncheckedThumbSize={toggleStyling.uncheckedThumbSize}
                style={toggleStyling.style}
                borderRadius={toggleStyling.borderRadius}
            />
        </div>
    );
};

export default ToggleSection;
