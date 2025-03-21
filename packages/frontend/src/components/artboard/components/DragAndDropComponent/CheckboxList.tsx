import { Wireframe } from "@backend/src/interfaces/artboard";
import { useUpdateShapeMutation } from "@/lib/api/shapes";
import { useState, useEffect } from "react";

export function CheckboxList(props: {
  shape: Extract<Wireframe, { type: "checkbox" }>;
  isEditable: boolean;
  onSetIsEditable: (isEditable: boolean) => void;
  projectId: number;
}) {
  const { mutate: handleUpdateShape } = useUpdateShapeMutation(props.projectId);
  const [localOptions, setLocalOptions] = useState(props.shape.options);

  // Update local state when props change
  useEffect(() => {
    setLocalOptions(props.shape.options);
  }, [props.shape.options]);

  const handleOptionChange = (optionId: string, changes: { isTicked?: boolean; label?: string }) => {
    const newOptions = localOptions?.map(opt => 
      opt.optionId === optionId 
        ? { ...opt, ...changes }
        : opt
    );
    
    setLocalOptions(newOptions);
    handleUpdateShape({
      shapeId: props.shape.id,
      args: {
        type: "checkbox",
        options: newOptions
      }
    });
  };

  return (
    <div 
      className="w-full h-full"
      onBlur={(e) => {
        // Only blur if clicking outside the component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          props.onSetIsEditable(false);
        }
      }}
    >
      <div>{props.shape.label}</div>
      <div className={`flex ${props.shape.subtype === "horizontal" ? "flex-row": "flex-col"} gap-2.5`}>
        {localOptions?.map((option, index) => (
          <div key={option.optionId} className="flex items-center flex-wrap">
            <input
              type="checkbox"
              className={`mr-2 ${props.isEditable ? "hover:cursor-pointer" : ""}`}
              readOnly={!props.isEditable}
              checked={option.isTicked}
              onChange={(e) => {
                handleOptionChange(option.optionId, { 
                  isTicked: e.target.checked 
                });
              }}
            />
            {props.isEditable ? (
              <input
                autoFocus={index === 0}
                className="ml-2 text-xs bg-transparent focus:outline-none grow"
                value={option.label}
                onChange={(e) => {
                  handleOptionChange(option.optionId, { 
                    label: e.target.value 
                  });
                }}
                onDoubleClick={(e) => {
                  e.currentTarget.select();
                }}
              />
            ) : (
              <span className="px-2 text-xs">
                {option.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}