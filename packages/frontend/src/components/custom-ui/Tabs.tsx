import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useInternalNavigationStore } from "../../store/useInternalNavigationStore";

const TabsContext = React.createContext<{ activeStyle?: React.CSSProperties }>(
    {}
);
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
        activeStyle?: React.CSSProperties;
    }
>(({ style, activeStyle, ...props }, ref) => {
    return (
        <TabsContext.Provider value={{ activeStyle }}>
            <TabsPrimitive.List
                ref={ref}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.375rem",
                    padding: "0.25rem",
                    width: "300px",
                    ...style,
                }}
                {...props}
            />
        </TabsContext.Provider>
    );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
        isActive?: boolean;
    }
>(({ isActive, style, ...props }, ref) => {
    const { InternalNavigationStyles } = useInternalNavigationStore();

    const combinedStyles = isActive
        ? { ...style, ...InternalNavigationStyles }
        : style;

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                padding: "8px 16px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#FFFFFF",
                cursor: "pointer",
                backgroundColor: "transparent",
                border: "none",
                ...combinedStyles,
            }}
            {...props}
        />
    );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export { Tabs, TabsList, TabsTrigger };
