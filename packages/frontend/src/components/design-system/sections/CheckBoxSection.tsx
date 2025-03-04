import { Checkbox } from "../../custom-ui/CheckBox";
import { useCheckBoxStore } from "../../../store/useCheckBoxStore";
import { FC, useEffect } from "react";
import CheckIcons from "../components/CheckIcons";

const CheckBoxSection: FC = () => {
    const { checkBoxStyling, checkBoxCustomIcon } = useCheckBoxStore();

    const CustomIconComponent = CheckIcons[checkBoxCustomIcon];

    return (
        <div style={{ display: "flex", gap: "2.75rem" }}>
            {checkBoxStyling && (
                <>
                    <Checkbox
                        style={{
                            ...checkBoxStyling.checkboxBaseStyles,
                            ...checkBoxStyling.checkedStyles,
                        }}
                        checked
                    />
                    <Checkbox style={checkBoxStyling.checkboxBaseStyles} />
                    <Checkbox
                        style={{
                            ...checkBoxStyling.checkboxBaseStyles,
                            ...checkBoxStyling.checkedAlternateStyles,
                        }}
                        checked
                        customIcon={
                            CustomIconComponent ? (
                                <CustomIconComponent />
                            ) : undefined
                        }
                    />
                    <Checkbox
                        style={{
                            ...checkBoxStyling.checkboxBaseStyles,
                            ...checkBoxStyling.checkedAlternateStyles,
                        }}
                        customIcon={
                            CustomIconComponent ? (
                                <CustomIconComponent />
                            ) : undefined
                        }
                    />
                </>
            )}
        </div>
    );
};

export default CheckBoxSection;
