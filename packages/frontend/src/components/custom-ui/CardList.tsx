import { useState } from "react";
import { Card, CardHeader, CardTitle } from "./Card";
import { Checkbox } from "./CheckBox";
import { CardStyleConfig } from "../../store/useCardStore";

interface CardListProps {
    listItems: Array<{ title: string; avatar?: string }>;
    cardStyle?: CardStyleConfig;
}

export default function CardList({ listItems, cardStyle }: CardListProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div>
            {listItems.map((item, index) => (
                <Card
                    key={index}
                    className={`h-fit text-white shadow-md border-none overflow-hidden rounded-none transition-all duration-300 ease-in-out ${
                        hoveredIndex === index
                            ? `bg-[${cardStyle?.hoveredBackgroundColor}]`
                            : "hover:bg-[#303637]"
                    } hover:shadow-lg`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                        backgroundColor:
                            hoveredIndex === index
                                ? cardStyle?.hoveredBackgroundColor
                                : cardStyle?.list?.backgroundColor,
                        color: cardStyle?.list?.color,
                        borderRadius: cardStyle?.list?.borderRadius,
                        width: cardStyle?.list?.width,
                    }}
                >
                    <CardHeader className="flex flex-row items-center w-full h-min gap-3 p-3">
                        {cardStyle?.list.showAvatar && item.avatar && (
                            <div className="flex w-5 h-5 rounded-full bg-[#5C451C] items-center justify-center text-white font-bold">
                                {item.avatar}
                            </div>
                        )}
                        <div
                            className={`flex-1 flex-col justify-center ${
                                cardStyle?.list.showAvatar ? "pb-2" : ""
                            }`}
                        >
                            <CardTitle className="text-base font-semibold text-gray-200">
                                {item.title}
                            </CardTitle>
                        </div>
                        {cardStyle?.list.showCheckbox && (
                            <div className="flex items-center justify-center w-6 h-6">
                                <Checkbox
                                    className="bg-transparent border-2 border-[#DEE3E5] h-5 w-5 checked:border-0 checked:text-[#412D00] checked:bg-[#ECC06C]"
                                    checked
                                />
                            </div>
                        )}
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
