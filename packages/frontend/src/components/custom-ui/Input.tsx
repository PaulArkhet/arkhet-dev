import { cn } from "../../lib/utils";
import React from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    clearable?: boolean;
    className?: string;
    labelClassName?: React.CSSProperties;
    supportingText?: string;
    supportingTextClassName?: React.CSSProperties;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            supportingText,
            clearable = false,
            className,
            labelClassName,
            supportingTextClassName,
            type = "text",
            ...props
        },
        ref
    ) => {
        const [inputValue, setInputValue] = React.useState("");
        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label
                        className="text-sm font-medium text-muted-foreground"
                        style={{ ...labelClassName }}
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={type}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                        className={cn(
                            "flex w-36 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 *:border-input focus-visible:ring-ring",
                            className
                        )}
                        {...props}
                    />
                    {clearable && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => {
                                setInputValue("");
                            }}
                        >
                            <span className="text-muted-foreground">×</span>
                        </button>
                    )}
                </div>
                {supportingText && (
                    <p
                        className={cn(
                            "text-xs text-muted-foreground pl-2",
                            supportingTextClassName
                        )}
                    >
                        {supportingText}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
