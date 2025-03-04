import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import React, { useState } from "react";
import { ButtonStyleConfig } from "../../store/useButtonStore";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    hoveredBackgroundColor?: string;
    hoveredTextColor?: string;
    style: ButtonStyleConfig;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            asChild = false,
            hoveredBackgroundColor,
            hoveredTextColor,
            style = {},
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";

        const [isHovered, setIsHovered] = useState(false);

        const combinedStyles = {
            ...style,
            backgroundColor:
                isHovered && hoveredBackgroundColor
                    ? hoveredBackgroundColor
                    : style.backgroundColor,
            color:
                isHovered && hoveredTextColor ? hoveredTextColor : style.color,
        };

        return (
            <Comp
                className={cn(buttonVariants({ className }))}
                ref={ref}
                style={combinedStyles}
                onMouseLeave={() => setIsHovered(false)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
