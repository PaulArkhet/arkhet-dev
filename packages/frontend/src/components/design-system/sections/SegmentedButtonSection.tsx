import { FC } from "react";
import SegmentedButton from "../../custom-ui/SegmentedButton";
import { useSegmentedButtonStore } from "../../../store/useSegmentedButtonStore";

const SegmentedButtonSection: FC = () => {
    const { SegmentedButtonStyles } = useSegmentedButtonStore();

    return (
        <SegmentedButton
            buttonLabels={SegmentedButtonStyles.buttonLabels}
            activeBgColor={SegmentedButtonStyles.activeBgColor}
            inactiveBgColor={SegmentedButtonStyles.inactiveBgColor}
            activeTextColor={SegmentedButtonStyles.activeTextColor}
            inactiveTextColor={SegmentedButtonStyles.inactiveTextColor}
            borderColor={SegmentedButtonStyles.borderColor}
            hoverBgColor={SegmentedButtonStyles.hoverBgColor}
        />
    );
};

export default SegmentedButtonSection;
