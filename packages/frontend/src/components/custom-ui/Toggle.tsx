import * as SwitchPrimitives from "@radix-ui/react-switch";
import React, { useState, useEffect } from "react";

interface ToggleProps
    extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
    isChecked: boolean;
    checkedBackgroundColor: string;
    uncheckedBackgroundColor: string;
    checkedButtonColor: string;
    uncheckedButtonColor: string;
    checkedBorderColor: string;
    uncheckedBorderColor: string;
    checkedThumbSize: string;
    uncheckedThumbSize: string;
    borderRadius: string;
}

const Toggle = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    ToggleProps
>(
    (
        {
            className,
            isChecked,
            checkedBackgroundColor,
            uncheckedBackgroundColor,
            checkedButtonColor,
            uncheckedButtonColor,
            checkedBorderColor,
            uncheckedBorderColor,
            checkedThumbSize,
            uncheckedThumbSize,
            borderRadius,
            ...props
        },
        ref
    ) => {
        const [checked, setChecked] = useState(isChecked);

        useEffect(() => {
            setChecked(isChecked);
        }, [isChecked]);

        return (
            <SwitchPrimitives.Root
                style={{
                    display: "inline-flex",
                    height: "20px",
                    width: "36px",
                    cursor: "pointer",
                    alignItems: "center",
                    border: `2px solid ${
                        checked ? checkedBorderColor : uncheckedBorderColor
                    }`,
                    backgroundColor: checked
                        ? checkedBackgroundColor
                        : uncheckedBackgroundColor,
                    borderRadius: borderRadius,
                    transition:
                        "background-color 0.2s ease, border-color 0.2s ease",
                    position: "relative",
                    opacity: props.disabled ? 0.5 : 1,
                    pointerEvents: props.disabled ? "none" : "auto",
                    ...props.style,
                }}
                checked={checked}
                onCheckedChange={setChecked}
                ref={ref}
            >
                <SwitchPrimitives.Thumb
                    style={{
                        backgroundColor: checked
                            ? checkedButtonColor
                            : uncheckedButtonColor,
                        height: checked ? checkedThumbSize : uncheckedThumbSize,
                        width: checked ? checkedThumbSize : uncheckedThumbSize,
                        borderRadius: borderRadius,
                        transform: checked
                            ? "translateX(16px)"
                            : "translateX(4px)",
                        transition:
                            "transform 0.2s ease, background-color 0.2s ease",
                        position: "absolute",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                />
            </SwitchPrimitives.Root>
        );
    }
);
Toggle.displayName = SwitchPrimitives.Root.displayName;

export { Toggle };
