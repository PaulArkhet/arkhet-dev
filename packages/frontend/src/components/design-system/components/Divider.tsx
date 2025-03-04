interface DividerProps {
    hrOption?: string;
    divOption?: string;
}

export default function Divider({ hrOption, divOption }: DividerProps) {
    return (
        <div className={`flex items-center ${divOption || `py-5`}`}>
            <hr
                className={`flex-grow border-t ${
                    hrOption || `border-gray-500`
                }`}
            />
        </div>
    );
}
