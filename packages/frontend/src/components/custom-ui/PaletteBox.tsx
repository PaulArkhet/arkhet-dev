interface CustomPaletteBoxProps {
    color: string;
    onClick: () => void;
}

export default function CustomPaletteBox({
    color,
    onClick,
}: CustomPaletteBoxProps) {
    return (
        <div
            className="flex flex-col gap-7 items-center justify-center"
            onClick={onClick}
        >
            <div
                className="w-[80px] h-[80px] rounded-full transition-shadow duration-500"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 1px 1px ${color}, 0 0 10px 1px ${color}`,
                }}
            />
            <p className="text-grey text-sm">{color}</p>
        </div>
    );
}
