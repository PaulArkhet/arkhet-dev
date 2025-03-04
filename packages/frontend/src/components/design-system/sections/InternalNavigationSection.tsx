import { FC, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../custom-ui/Tabs";
import { useInternalNavigationStore } from "../../../store/useInternalNavigationStore";

const InternalNavigationSection: FC = () => {
    const { InternalNavigationStyles } = useInternalNavigationStore();

    const [activeTab, setActiveTab] = useState("Tab One");

    const selectTab = (tabName: string) => {
        setActiveTab(tabName);
    };

    return (
        <Tabs defaultValue={activeTab}>
            <TabsList
                style={{
                    backgroundColor: "transparent",
                    justifyContent: "space-evenly",
                    ...InternalNavigationStyles.internal,
                }}
            >
                {["Tab One", "Tab Two", "Tab Three"].map((tab) => (
                    <TabsTrigger
                        key={tab}
                        value={tab}
                        isActive={activeTab === tab}
                        onClick={() => selectTab(tab)}
                        style={
                            activeTab === tab
                                ? InternalNavigationStyles.active
                                : undefined
                        }
                    >
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export default InternalNavigationSection;
