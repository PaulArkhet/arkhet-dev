import { useEffect, useState } from "react";
import CustomSelect from "../../custom-ui/Select";
import { Font, FontsApiResponse } from "../../../types/typography-types";
import { loadFonts } from "../../../utils/fontLoader";
import {
  getHeaderProperties,
  headers,
  useTypographyStore,
} from "../../../store/useTypographyStore";
import { getUserIdFromToken } from "../../../services/jwt.service";
import { useUpdateStyleguideMutation } from "@/lib/api/styleguides";
import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";

const GOOGLE_FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${
  import.meta.env.VITE_GOOGLE_FONTS_API_KEY
}&sort=popularity`;

const TypographySection = (props: { styleguide: StyleguideWithJoins }) => {
  const { updateActiveHeader } = useTypographyStore((state) => state);
  const [fontOptions, setFontOptions] = useState<Font[]>([]);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    const fetchFonts = async (): Promise<void> => {
      try {
        const response = await fetch(GOOGLE_FONTS_API_URL);
        const data: FontsApiResponse = await response.json();
        setFontOptions(data.items.slice(0, 50));
      } catch (error) {
        console.error("Error fetching fonts:", error);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    loadFonts([props.styleguide.typographyStyles.selectedFont]);
  }, [props.styleguide.typographyStyles.selectedFont]);

  const { mutate: updateStyleguideMutation } = useUpdateStyleguideMutation();

  useEffect(() => {
    if (selectedOption && props.styleguide) {
      updateStyleguideMutation({
        styleguideId: props.styleguide.styleguideId!,
        typographyStyles: {
          selectedFont: selectedOption,
        },
      });
    }
  }, [selectedOption]);

  const handleClick = (key: string) => {
    const header = headers.find((header) => header.key === key);
    if (header) {
      updateActiveHeader(header.key);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 items-center pb-5">
        <p>Font Family:</p>
        <CustomSelect
          selectOptions={fontOptions.map((font) => font.family)}
          currentFontFamily={props.styleguide.typographyStyles.selectedFont}
          updateFunc={setSelectedOption}
        />
      </div>
      {headers
        .map((header) => ({
          ...header,
          properties: getHeaderProperties(header.key, props.styleguide),
        }))
        .map(({ key, label, properties }) => (
          <div
            key={key}
            className="flex hover:cursor-pointer"
            style={{
              fontFamily: props.styleguide.typographyStyles.selectedFont,
            }}
            onClick={() => handleClick(key)}
          >
            {key === "link" ? (
              <>
                <a
                  className="relative inline-block text-[#F1B000] underline w-52"
                  style={{
                    fontSize: properties.size,
                    fontWeight: properties.weight,
                  }}
                >
                  {label}
                </a>
                <p
                  className="grow"
                  style={{
                    fontSize: properties.size,
                    fontWeight: properties.weight,
                  }}
                >
                  The quick brown fox jumps over the{" "}
                  <a className="relative inline-block text-[#F1B000] underline">
                    lazy dog
                  </a>
                </p>
              </>
            ) : (
              <>
                <p
                  className="font-bold w-52 pb-6"
                  style={{
                    fontSize: properties.size,
                    fontWeight: properties.weight,
                  }}
                >
                  {label}
                </p>
                <p
                  className="grow"
                  style={{
                    fontSize: properties.size,
                    fontWeight: properties.weight,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default TypographySection;
