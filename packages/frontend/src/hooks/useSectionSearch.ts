import { useEffect, useState } from "react";

type SectionRefs = {
    [key: string]: React.RefObject<HTMLDivElement>;
};

export const useSectionSearch = (search: string, sections: SectionRefs) => {
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    useEffect(() => {
        if (!debouncedSearch) return;

        const query = debouncedSearch.trim().toLowerCase();
        const matchedSection = Object.keys(sections).find((key) =>
            key.toLowerCase().includes(query)
        );

        if (matchedSection && sections[matchedSection].current) {
            sections[matchedSection].current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [debouncedSearch, sections]);
};
