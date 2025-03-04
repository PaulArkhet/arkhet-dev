import React from "react";

export const CheckIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
            d="M5 12l5 5L20 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const CheckCircleIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="11" r="8" fill="#412D00" />
        <path
            d="M9.5 12l2 2L14.5 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const BoldCheckIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
            d="M5 12l5 5L20 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const StraightLineIcon: React.FC = () => (
    <svg width="12" height="5" viewBox="0 0 16 2" fill="none">
        <rect width="16" height="2" fill="currentColor" />
    </svg>
);

export const CheckIcons = {
    Check: CheckIcon,
    Circle: CheckCircleIcon,
    Bold: BoldCheckIcon,
    Straight: StraightLineIcon,
};

export type checkIconNames = keyof typeof CheckIcons;
export default CheckIcons;
