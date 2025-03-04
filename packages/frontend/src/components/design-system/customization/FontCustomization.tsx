import {
  ActiveHeaderOptions,
  getHeaderProperties,
  getSizeKeys,
  useTypographyStore,
} from "../../../store/useTypographyStore";
import CustomSelect from "../../custom-ui/Select";
import { useEffect, useState } from "react";
import { fontSizes } from "../../../utils/fontLoader";
import {
  fontWeights,
  fontSizeRanges,
  getHeaderDisplayName,
} from "../../../utils/headerUtils";
import { useButtonStore } from "../../../store/useButtonStore";
import { useQuery } from "@tanstack/react-query";
import {
  getAllStyleguidesQueryOptions,
  useUpdateStyleguideMutation,
} from "@/lib/api/styleguides";

const filterFontSizes = (activeHeader: ActiveHeaderOptions): string[] => {
  if (activeHeader === "none" || !fontSizeRanges[activeHeader]) {
    return fontSizes;
  }

  const { min, max } = fontSizeRanges[activeHeader];
  return fontSizes.filter(
    (size) => parseInt(size) >= min && parseInt(size) <= max
  );
};

export default function FontCustomization() {
  const { activeHeader } = useTypographyStore();
  const { data: styleguideQueryResult } = useQuery(
    getAllStyleguidesQueryOptions
  );

  if (!styleguideQueryResult) return null;

  const { setButtonType } = useButtonStore();
  const [weight, setWeight] = useState<string>(
    getHeaderProperties(activeHeader, styleguideQueryResult[0]).weight
  );
  const [size, setSize] = useState<string>(
    getHeaderProperties(activeHeader, styleguideQueryResult[0]).size
  );

  const { mutate: updateStyleguideMutation } = useUpdateStyleguideMutation();

  useEffect(() => {
    if (activeHeader === "none") return;
    const { size, weight } = getHeaderProperties(
      activeHeader,
      styleguideQueryResult[0]
    );

    console.log(size, weight, "from get header props");

    setSize(size);
    setWeight(weight);
  }, [activeHeader]);

  useEffect(() => {
    const keys = getSizeKeys(activeHeader);
    if (!keys) return;

    const { sizeKey, weightKey } = keys;

    updateStyleguideMutation({
      styleguideId: styleguideQueryResult[0].styleguideId,
      typographyStyles: {
        [sizeKey]: size,
        [weightKey]: weight,
      },
    });
  }, [size, weight]);

  return (
    <div
      className="p-3 text-sm"
      onClick={() => {
        setButtonType("");
      }}
    >
      <h1 className="font-semibold">{getHeaderDisplayName(activeHeader)}</h1>
      <div className="flex flex-row justify-evenly p-3">
        <CustomSelect
          selectOptions={Object.keys(fontWeights)}
          currentFontFamily={weight}
          value={
            Object.entries(fontWeights).find(
              ([_key, value]) => weight === value
            )![0]
          }
          updateFunc={(weight) =>
            setWeight(fontWeights[weight as keyof typeof fontWeights])
          }
        />
        <CustomSelect
          selectOptions={filterFontSizes(activeHeader)}
          currentFontFamily={
            styleguideQueryResult[0].typographyStyles.selectedFont
          }
          value={size}
          updateFunc={(size) => {
            console.log(size, "new size from updateFunc");
            setSize(size);
          }}
        />
      </div>
    </div>
  );
}
