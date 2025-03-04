import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface ToggleStyleConfig {
  isChecked: boolean;
  checkedBackgroundColor: string;
  uncheckedBackgroundColor: string;
  checkedButtonColor: string;
  uncheckedButtonColor: string;
  checkedBorderColor: string;
  uncheckedBorderColor: string;
  checkedThumbSize: string;
  uncheckedThumbSize: string;
  style: React.CSSProperties;
  borderRadius: string;
}

interface ToggleStore {
  toggleStyling: ToggleStyleConfig;
  setToggleStyling: (styles: Partial<ToggleStyleConfig>) => void;
  customizationEnabledToggle: boolean;
  setCustomizationToggle: (enabled: boolean) => void;
  resetToggleStyling: () => void;
}

const defaultToggleStyling: ToggleStyleConfig = {
  isChecked: false,
  checkedBackgroundColor: "#ECC06C",
  uncheckedBackgroundColor: "rgba(48, 54, 55, 0.5)",
  checkedButtonColor: "#412D00",
  uncheckedButtonColor: "#8C9388",
  checkedBorderColor: "#ECC06C",
  uncheckedBorderColor: "#8C9388",
  checkedThumbSize: "16px",
  uncheckedThumbSize: "12px",
  style: { height: "24px", width: "40px" },
  borderRadius: "20px",
};

export const useToggleStore = create<ToggleStore>((set) => ({
  toggleStyling: defaultToggleStyling,

  setToggleStyling: (styles) =>
    set((state) => {
      const updatedStyles = {
        ...state.toggleStyling,
        ...styles,
        style: { ...state.toggleStyling.style, ...styles.style },
      };

      const hasChanges =
        JSON.stringify(state.toggleStyling) !==
        JSON.stringify(updatedStyles);

      if (hasChanges) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState()
            .currentlyDisplayingStyleGuide?.styleguide_id;

        if (userId && styleGuideId) {
          debouncedFunctions.toggle(
            updatedStyles,
            userId,
            styleGuideId
          );
        }
      }

      return { toggleStyling: updatedStyles };
    }),

  customizationEnabledToggle: false,
  setCustomizationToggle: (enabled) =>
    set({ customizationEnabledToggle: enabled }),
  resetToggleStyling: () => set({ toggleStyling: defaultToggleStyling }),
}));
