import { useColorPaletteStore } from "../../../store/useColorPaletteStore";
import CustomPaletteBox from "../../custom-ui/PaletteBox";
import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";

const ColorSection = (props: { styleguide: StyleguideWithJoins }) => {
  const { setActivePalette } = useColorPaletteStore();

  return (
    <div className="flex items-start gap-16">
      <div className="category-styling">
        <p className="text-white text-[12px] tracking-[.20em] font-semibold">
          PRIMARY
        </p>
        {[props.styleguide.primaryColor].map((color, index) => (
          <CustomPaletteBox
            key={index}
            color={color}
            onClick={() => {
              setActivePalette({ _tag: "primaryColor" });
            }}
          />
        ))}
      </div>
      <div className="category-styling">
        <p className="text-white text-[12px] tracking-[.20em] font-semibold">
          SECONDARY
        </p>
        <div className="color-container-styling">
          {[
            props.styleguide.secondaryColorStyles.firstColor,
            props.styleguide.secondaryColorStyles.secondColor,
          ].map((color, index) => (
            <CustomPaletteBox
              key={index}
              color={color}
              onClick={() => {
                setActivePalette({
                  _tag: "secondaryColorStyles",
                  key: index === 0 ? "firstColor" : "secondColor",
                });
              }}
            />
          ))}
        </div>
      </div>
      <div className="category-styling">
        <p className="text-white text-[12px] tracking-[.20em] font-semibold">
          NEUTRAL
        </p>

        <div className="color-container-styling">
          {[
            props.styleguide.neutralColorStyles.firstColor,
            props.styleguide.neutralColorStyles.secondColor,
            props.styleguide.neutralColorStyles.thirdColor,
          ].map((color, index) => (
            <CustomPaletteBox
              key={index}
              color={color}
              onClick={() => {
                setActivePalette({
                  _tag: "neutralColorStyles",
                  key:
                    index === 0
                      ? "firstColor"
                      : index === 1
                        ? "secondColor"
                        : "thirdColor",
                });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorSection;
