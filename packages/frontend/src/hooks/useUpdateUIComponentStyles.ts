import { useEffect } from "react";
import type { Styleguide } from "@backend/db/schemas/styleguides";
import { useColorPaletteStore } from "../store/useColorPaletteStore";
import { useTypographyStore } from "../store/useTypographyStore";
import { useButtonStore } from "../store/useButtonStore";
import { useRadioButtonStore } from "../store/useRadioButtonStore";
import { useTextFieldStore } from "../store/useTextFieldStore";
import { useToggleStore } from "../store/useToggleStore";
import { useCheckBoxStore } from "../store/useCheckBoxStore";
import { useInternalNavigationStore } from "../store/useInternalNavigationStore";
import { useSegmentedButtonStore } from "../store/useSegmentedButtonStore";
import { useCardStore } from "../store/useCardStore";

function useUpdateUIComponentStyles(displayingStyleGuide: Styleguide | null) {
  // const { setPalette, resetPalette } = useColorPaletteStore();
  const { updateSelectedFont, resetTypography } = useTypographyStore();
  const { setButtonStyles, resetButtonStyles } = useButtonStore();
  const { setRadioButtonStyles, resetRadioButtonStyles } =
    useRadioButtonStore();
  const { setTextFieldStyling, resetTextFieldStyling } = useTextFieldStore();
  const { setToggleStyling, resetToggleStyling } = useToggleStore();
  const { setCheckBoxStyling, resetCheckBoxStyling } = useCheckBoxStore();
  const { setInternalNavigationStyles, resetInternalNavigationStyles } =
    useInternalNavigationStore();
  const { setSegmentedButtonStyles, resetSegmentedButtonStyles } =
    useSegmentedButtonStore();
  const { setCardStyles, resetCardStyles } = useCardStore();

  useEffect(() => {
    if (!displayingStyleGuide) {
      resetPalette();
      resetTypography();
      resetButtonStyles();
      resetRadioButtonStyles();
      resetTextFieldStyling();
      resetToggleStyling();
      resetCheckBoxStyling();
      resetInternalNavigationStyles();
      resetSegmentedButtonStyles();
      resetCardStyles();
      return;
    }

    if (displayingStyleGuide.typography) {
      updateSelectedFont(JSON.parse(displayingStyleGuide.typography));
    }
    if (displayingStyleGuide.colors) {
      const colors = JSON.parse(displayingStyleGuide.colors);
      setPalette("primary", 0, colors.primary);
      setPalette("accents", 0, colors.accents[0]);
      setPalette("accents", 1, colors.accents[1]);
      setPalette("neutral", 0, colors.neutral[0]);
      setPalette("neutral", 1, colors.neutral[1]);
      setPalette("neutral", 2, colors.neutral[2]);
    }
    if (displayingStyleGuide.buttons) {
      const buttons = JSON.parse(displayingStyleGuide.buttons);
      setButtonStyles("primary", buttons.primary);
      setButtonStyles("secondary", buttons.secondary);
      setButtonStyles("outlined", buttons.outlined);
      setButtonStyles("ghost", buttons.ghost);
    }
    if (displayingStyleGuide.radiobuttons) {
      const radiobuttons = JSON.parse(displayingStyleGuide.radiobuttons);
      setRadioButtonStyles(radiobuttons);
    }
    if (displayingStyleGuide.textfields) {
      const textfields = JSON.parse(displayingStyleGuide.textfields);
      setTextFieldStyling(textfields);
    }
    if (displayingStyleGuide.toggle) {
      const togglebuttons = JSON.parse(displayingStyleGuide.toggle);
      setToggleStyling(togglebuttons);
    }
    if (displayingStyleGuide.checkboxes) {
      const checkboxes = JSON.parse(displayingStyleGuide.checkboxes);
      setCheckBoxStyling(checkboxes);
    }
    if (displayingStyleGuide.internalnavigation) {
      const internalnavigation = JSON.parse(
        displayingStyleGuide.internalnavigation
      );
      setInternalNavigationStyles(
        { ...internalnavigation.internal },
        { ...internalnavigation.active }
      );
    }
    if (displayingStyleGuide.segmentedbutton) {
      const segmentedbuttons = JSON.parse(
        displayingStyleGuide.segmentedbutton
      );
      setSegmentedButtonStyles(segmentedbuttons);
    }
    if (displayingStyleGuide.card) {
      const card = JSON.parse(displayingStyleGuide.card);
      setCardStyles(card);
    }
  }, [displayingStyleGuide]);
}

export default useUpdateUIComponentStyles;
