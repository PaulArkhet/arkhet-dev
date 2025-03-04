import { useColorPaletteStore } from "../../../store/useColorPaletteStore";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";
import { useUpdateStyleguideMutation } from "@/lib/api/styleguides";

export default function ColorCustomization(props: {
  styleguide: StyleguideWithJoins;
}) {
  const { selection } = useColorPaletteStore();
  const { mutate: updateStyleguideMutation } = useUpdateStyleguideMutation();

  if (selection._tag === "none") return null;

  const [hex, setHex] = useState(getHexFromSelection());

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (selection._tag === "primaryColor") {
        updateStyleguideMutation({
          styleguideId: props.styleguide.styleguideId,
          primaryColor: hex,
        });
        return;
      }

      updateStyleguideMutation({
        styleguideId: props.styleguide.styleguideId,
        [selection._tag]: {
          ...props.styleguide[selection._tag],
          [selection.key]: hex,
        },
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [hex]);

  useEffect(() => {
    setHex(getHexFromSelection());
  }, [selection]);

  function getHexFromSelection() {
    if (selection._tag === "primaryColor") {
      return props.styleguide[selection._tag];
    }

    if (selection._tag === "secondaryColorStyles") {
      return props.styleguide[selection._tag][selection.key];
    }

    if (selection._tag === "neutralColorStyles") {
      return props.styleguide[selection._tag][selection.key];
    }

    return "";
  }

  return (
    <div
      className="customization-panel-styling flex flex-col space-y-1"
      /*
      onClick={() => { // unsure as to why this was here
       updateActiveHeader("none"); 
      }}
      */
    >
      <p className="text-sm font-semibold w-full text-left">
        <span className="font-normal">Color Palette: </span>
        {selection._tag}
      </p>
      <Popover>
        <PopoverTrigger>
          <div className="bg-zinc-950 px-2 py-1 w-56 space-x-2 rounded-md flex items-center">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: hex }}
            />
            <span className="text-white font-mono">{hex}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="bg-zinc-950 w-fit h-fit">
          <HexColorPicker
            color={hex}
            onChange={(hex) => setHex(hex.toUpperCase())}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
