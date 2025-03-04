import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface SegmentedButtonStyleConfig {
  buttonLabels: string[];
  activeBgColor: string;
  inactiveBgColor: string;
  activeTextColor: string;
  inactiveTextColor: string;
  borderColor: string;
  hoverBgColor: string;
}

interface useSegmentedButtonStore {
  SegmentedButtonStyles: SegmentedButtonStyleConfig;
  setSegmentedButtonStyles: (
    styles: Partial<useSegmentedButtonStore["SegmentedButtonStyles"]>
  ) => void;
  customizationEnabledSegmentedButton: boolean;
  setCustomizationSegmentedButton: (enabled: boolean) => void;
  resetSegmentedButtonStyles: () => void;
}

const defaultSegmentedButtonStyles: SegmentedButtonStyleConfig = {
  buttonLabels: ["Label", "Label", "Label", "Label"],
  activeBgColor: "#004d61",
  inactiveBgColor: "#242424",
  activeTextColor: "#b8eaff",
  inactiveTextColor: "#dee3e5",
  borderColor: "#8c9388",
  hoverBgColor: "#343335",
};

export const useSegmentedButtonStore = create<useSegmentedButtonStore>(
  (set) => ({
    SegmentedButtonStyles: defaultSegmentedButtonStyles,

    setSegmentedButtonStyles: (styles) =>
      set((state) => {
        const updatedStyles = {
          ...state.SegmentedButtonStyles,
          ...styles,
        };

        const hasChanges =
          JSON.stringify(state.SegmentedButtonStyles) !==
          JSON.stringify(updatedStyles);

        if (hasChanges) {
          const userId = useAuthStore.getState().user?.user_id;
          const styleGuideId =
            useUploadedStyleGuideStore.getState()
              .currentlyDisplayingStyleGuide?.styleguide_id;

          if (userId && styleGuideId) {
            debouncedFunctions.segmentedbutton(
              updatedStyles,
              userId,
              styleGuideId
            );
          }

          return { SegmentedButtonStyles: updatedStyles };
        }
        return state;
      }),
    customizationEnabledSegmentedButton: false,
    setCustomizationSegmentedButton: (enabled) =>
      set({ customizationEnabledSegmentedButton: enabled }),
    resetSegmentedButtonStyles: () =>
      set({ SegmentedButtonStyles: defaultSegmentedButtonStyles }),
  })
);
