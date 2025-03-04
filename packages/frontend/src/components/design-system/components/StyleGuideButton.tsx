import { useState } from "react";

interface StyleGuideButtonProps {
    index: number;
    title: string;
    clickHandler: (index: number) => void;
    deleteHandler: (index: number) => void;
    selectedIndex: number;
}

const StyleGuideButton: React.FC<StyleGuideButtonProps> = ({
    index,
    title,
    clickHandler,
    deleteHandler,
    selectedIndex,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => clickHandler(index)}
            className={`flex rounded-2xl w-fit text-sm justify-center items-center gap-2 px-3 h-fit py-1 border border-blue-400 ${
                selectedIndex === index
                    ? "bg-blue-400 text-white"
                    : "bg-transparent text-blue-400"
            }`}
        >
            <p>{title}</p>
            {hoveredIndex === index && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteHandler(index);
                    }}
                    className="text-red-300 text-xs hover:text-red-900 transition-colors duration-200"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default StyleGuideButton;
