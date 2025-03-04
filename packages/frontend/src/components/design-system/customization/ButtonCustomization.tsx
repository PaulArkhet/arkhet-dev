import { useButtonStore } from "../../../store/useButtonStore";
import { capitalizeText, removePx } from "../../../utils/helpers";
import { Slider } from "../../ui/slider";
import { useEffect, useReducer, useState } from "react";
import { buttonReducer } from "../../../reducers/buttonReducer";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useRadioButtonStore } from "../../../store/useRadioButtonStore";
import { radioButtonReducer } from "../../../reducers/radioButtonReducer";
import { useTypographyStore } from "../../../store/useTypographyStore";
import Divider from "../components/Divider";

export default function ButtonCustomization() {
  const { buttonType, getButtonStyles, setButtonStyles } = useButtonStore();
  const { getRadioButtonStyles, setRadioButtonStyles } = useRadioButtonStore();

  if (!buttonType) return null;

  const buttonInitialStyles = getButtonStyles(buttonType);
  const radioButtonInitialStyles = getRadioButtonStyles();

  const [buttonState, buttonDispatch] = useReducer(
    buttonReducer,
    buttonInitialStyles
  );
  const [radioButtonState, radioButtonDispatch] = useReducer(
    radioButtonReducer,
    radioButtonInitialStyles
  );
  const [selectedBorderRadius, setSelectedBorderRadius] = useState(
    buttonState.borderRadius
  );

  useEffect(() => {
    if (buttonType) {
      const styles = getButtonStyles(buttonType);
      buttonDispatch({
        type: "SET_FONT_SIZE",
        payload: removePx(styles.fontSize),
      });
      buttonDispatch({
        type: "SET_BORDER_RADIUS",
        payload: removePx(styles.borderRadius),
      });
      buttonDispatch({
        type: "SET_PADDING_X",
        payload: removePx(styles.paddingRight),
      });
      buttonDispatch({
        type: "SET_PADDING_Y",
        payload: removePx(styles.paddingTop),
      });
    }
  }, [buttonType, getButtonStyles]);

  useEffect(() => {
    const styles = getRadioButtonStyles();
    radioButtonDispatch({
      type: "SET_HEIGHT",
      payload: removePx(styles.height),
    });
    radioButtonDispatch({
      type: "SET_WIDTH",
      payload: removePx(styles.width),
    });
    radioButtonDispatch({
      type: "SET_BORDER_WIDTH",
      payload: removePx(styles.borderWidth),
    });
  }, [getRadioButtonStyles]);

  useEffect(() => {
    if (buttonType) {
      setButtonStyles(buttonType, {
        fontSize: `${buttonState.fontSize}`,
        borderRadius: `${buttonState.borderRadius}`,
        paddingTop: `${buttonState.paddingTop}`,
        paddingBottom: `${buttonState.paddingBottom}`,
        paddingRight: `${buttonState.paddingRight}`,
        paddingLeft: `${buttonState.paddingLeft}`,
      });
    }
  }, [buttonType, buttonState, setButtonStyles]);

  useEffect(() => {
    setRadioButtonStyles({
      height: `${radioButtonState.height}`,
      width: `${radioButtonState.width}`,
      borderWidth: `${radioButtonState.borderWidth}`,
    });
  }, [radioButtonState, setRadioButtonStyles]);

  const handleBadgeClick = (borderRadius: number) => {
    setSelectedBorderRadius(JSON.stringify(borderRadius));
    buttonDispatch({
      type: "SET_BORDER_RADIUS",
      payload: borderRadius,
    });
  };

  if (!buttonType) return null;

  return (
    <div className="customization-panel-styling text-sm">
      <h1 className="pb-3 font-semibold">
        <span className="font-normal">Buttons: </span>
        {capitalizeText(buttonType)}
      </h1>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="flex flex-row gap-x-1">
            <h2>Font Size: </h2>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="font-bold">
                  {buttonState.fontSize}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-max bg-zinc-950 text-white rounded-xl">
                  {[...Array(10)].map((_, index) => {
                    const fontSize = 11 + index;
                    return (
                      <DropdownMenuItem
                        key={fontSize}
                        onClick={() =>
                          buttonDispatch({
                            type: "SET_FONT_SIZE",
                            payload: fontSize,
                          })
                        }
                      >
                        {fontSize}px
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <h2>Border Radius: {buttonState.borderRadius}</h2>
          <div className="flex flex-wrap gap-2 ">
            {[
              { label: "None", value: 0 },
              { label: "Small", value: 5 },
              { label: "Medium", value: 10 },
              { label: "Large", value: 15 },
              { label: "Extra", value: 20 },
            ].map(({ label, value }) => (
              <Badge
                key={value}
                onClick={() => handleBadgeClick(value)}
                className={`cursor-pointer hover:bg-gray-600 ${
                  selectedBorderRadius === JSON.stringify(value)
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {label} ({value}px)
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <h2>Padding X: {buttonState.paddingRight}</h2>
          <Slider
            value={[removePx(buttonState.paddingRight)]}
            min={15}
            max={30}
            step={1}
            onValueChange={(value) =>
              buttonDispatch({
                type: "SET_PADDING_X",
                payload: value[0],
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <h2>Padding Y: {buttonState.paddingTop}</h2>
          <Slider
            value={[removePx(buttonState.paddingTop)]}
            max={30}
            min={18}
            step={1}
            onValueChange={(value) =>
              buttonDispatch({
                type: "SET_PADDING_Y",
                payload: value[0],
              })
            }
          />
        </div>
      </div>
      <Divider />
      <h2 className="pb-3 font-semibold">Radio Button Settings</h2>
      <div className="grid gap-2">
        <h3>Height: {radioButtonState.height}</h3>
        <Slider
          value={[removePx(radioButtonState.height)]}
          max={50}
          min={24}
          step={1}
          onValueChange={(value) =>
            radioButtonDispatch({
              type: "SET_HEIGHT",
              payload: value[0],
            })
          }
        />
      </div>
      <div className="grid gap-2">
        <h3>Width: {radioButtonState.width}</h3>
        <Slider
          value={[removePx(radioButtonState.width)]}
          max={50}
          min={20}
          step={1}
          onValueChange={(value) =>
            radioButtonDispatch({
              type: "SET_WIDTH",
              payload: value[0],
            })
          }
        />
      </div>
      <div className="grid gap-2">
        <h3>Border Width: {radioButtonState.borderWidth}</h3>
        <Slider
          value={[removePx(radioButtonState.borderWidth)]}
          max={15}
          min={1}
          step={1}
          onValueChange={(value) =>
            radioButtonDispatch({
              type: "SET_BORDER_WIDTH",
              payload: value[0],
            })
          }
        />
      </div>
    </div>
  );
}
