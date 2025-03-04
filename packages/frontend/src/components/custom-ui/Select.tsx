import * as Select from "@radix-ui/react-select";
import dropdownIcon from "/icondropdown2.png";
import React, { useState } from "react";

interface CustomSelectProps {
  selectOptions: string[];
  currentFontFamily: string;
  updateFunc: (value: string) => void;
  value?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children }, forwardedRef) => (
    <Select.Item
      className="leading-none items-center select-none text-gray-500 cursor-pointer data-[disabled]:pointer-events-none data-[highlighted]:outline-none hover:text-zinc-400 transition-colors duration-200 p-2 relative"
      value={value}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center" />
    </Select.Item>
  )
);

export default function CustomSelect({
  selectOptions,
  currentFontFamily,
  updateFunc,
  value,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleValueChange = (value: string) => {
    updateFunc(value);
  };

  return (
    <Select.Root
      onOpenChange={setIsOpen}
      onValueChange={handleValueChange}
      value={value}
    >
      <Select.Trigger className="inline-flex items-center justify-center leading-none hover:bg-mauve3 outline-none">
        <Select.Value placeholder={currentFontFamily} />
        <Select.Icon
          className={`mx-1 transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <img src={dropdownIcon} alt="Dropdown Icon" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-gray-100 rounded-md shadow-lg overflow-auto max-h-60 p-2"
          position="popper"
          sideOffset={10}
        >
          <Select.Viewport>
            <Select.Group>
              {selectOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-700" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
