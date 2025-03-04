import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
        checked?: boolean;
        customIcon?: React.ReactNode;
    }
>(({ className, checked, customIcon, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false);

    React.useEffect(() => {
        setIsChecked(checked || false);
    }, [checked]);

    const checkHandler = () => {
        setIsChecked(!isChecked);
    };


    const checkboxStyles = {
        height: "1rem", 
        width: "1rem", 
        borderRadius: "0.125rem",
        border: "1px solid var(--primary)", 
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", 
        outline: "none",
        backgroundColor: isChecked ? "var(--primary)" : "white",
        cursor: "pointer",
        opacity: 1,
    };

    const indicatorStyles = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "currentColor",
        transform: "translateY(-1px)", 
    };

    const disabledStyles = {
        cursor: "not-allowed",
        opacity: 0.5,
    };

    return (
        <CheckboxPrimitive.Root
            ref={ref}
            checked={isChecked}
            onCheckedChange={checkHandler}
            style={
                isChecked
                    ? { ...checkboxStyles, ...disabledStyles }
                    : checkboxStyles
            }
            {...props}
        >
            <CheckboxPrimitive.Indicator style={indicatorStyles}>
                {customIcon || (
                    <CheckIcon
                        style={{ height: "1.25rem", width: "1.25rem" }}
                    />
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
