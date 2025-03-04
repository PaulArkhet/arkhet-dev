import { cn } from "../../../lib/utils";

interface CircularSkeletonProps {
    size?: "sm" | "md" | "lg";
    color?: "primary" | "secondary" | "accent";
}

export default function CircularSkeletonProps({
    size = "md",
    color = "primary",
}: CircularSkeletonProps = {}) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };

    const colorClasses = {
        primary: "bg-primary/20",
        secondary: "bg-secondary/20",
        accent: "bg-accent/20",
    };

    return (
        <div
            className={cn(
                "rounded-full animate-pulse",
                sizeClasses[size],
                colorClasses[color]
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
