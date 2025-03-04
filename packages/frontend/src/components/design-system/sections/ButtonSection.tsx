import { FC, useState } from "react";
import { Button } from "../../custom-ui/Button";
import { useButtonStore } from "../../../store/useButtonStore";
import { buttonStyles } from "../../../store/useButtonStore";
import { useTextFieldStore } from "../../../store/useTextFieldStore";
import { useInternalNavigationStore } from "../../../store/useInternalNavigationStore";

const ButtonSection: FC = () => {
    const { buttonStyles, setButtonType } = useButtonStore();
    const { setCustomizationTextField } = useTextFieldStore();
    const { setCustomizationInternalNavigation } = useInternalNavigationStore();

    const [hoverStates, setHoverStates] = useState({
        primary: false,
        secondary: false,
        outlined: false,
        ghost: false,
    });

    const getButtonStyle = (type: keyof buttonStyles) => ({
        ...buttonStyles[type],
        ...(hoverStates[type]
            ? {
                  backgroundColor: buttonStyles[type].hoveredBackgroundColor,
                  color: buttonStyles[type].hoveredTextColor,
              }
            : {}),
    });

    const renderButton = (type: keyof buttonStyles, label: string) => (
        <Button
            style={getButtonStyle(type)}
            onMouseEnter={() =>
                setHoverStates((prev) => ({ ...prev, [type]: true }))
            }
            onMouseLeave={() =>
                setHoverStates((prev) => ({ ...prev, [type]: false }))
            }
            onClick={() => {
                setButtonType(type);
                setCustomizationTextField(false);
                setCustomizationInternalNavigation(false);
            }}
        >
            {label}
        </Button>
    );

    return (
        <div className="flex flex-wrap gap-14 mt-3">
            <div className="w-fit justify-self-start">
                <div className="flex items-start gap-5 flex-wrap">
                    {renderButton("primary", "Primary Button")}
                    {renderButton("secondary", "Secondary Button")}
                    {renderButton("outlined", "Outlined Button")}
                    {renderButton("ghost", "Ghost Button")}
                </div>
            </div>
        </div>
    );
};

export default ButtonSection;
