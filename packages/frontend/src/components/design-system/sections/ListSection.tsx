import { FC } from "react";
import CardList from "../../custom-ui/CardList";
import { useCardStore } from "../../../store/useCardStore";

const ListSection: FC = () => {
    const { cardStyles } = useCardStore();

    return (
        <div className="flex gap-5">
            <CardList
                listItems={[
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                    { title: "List item", avatar: "A" },
                ]}
                cardStyle={cardStyles}
            />
            <CardList
                listItems={[
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                    { title: "Menu item" },
                ]}
                cardStyle={cardStyles}
            />
        </div>
    );
};

export default ListSection;
