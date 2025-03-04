import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface RadioButtonStyleConfig {
  height: string;
  width: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  borderColorChecked: string;
  color: string;
  customIcon: {
    height: string;
    width: string;
    backgroundColor: string;
    borderRadius: string;
  };
}

interface RadioButtonStore {
  radioButtonStyles: RadioButtonStyleConfig;
  setRadioButtonStyles: (config: Partial<RadioButtonStyleConfig>) => void;
  getRadioButtonStyles: () => RadioButtonStyleConfig;
  resetRadioButtonStyles: () => void;
}

const defaultRadioButtonStyles: RadioButtonStyleConfig = {
  height: "24px",
  width: "24px",
  borderColor: "#D4A84F",
  borderWidth: "4px",
  borderRadius: "50%",
  borderColorChecked: "#D4A84F",
  color: "#D4A84F",
  customIcon: {
    height: "8px",
    width: "8px",
    backgroundColor: "#D4A84F",
    borderRadius: "50%",
  },
};

export const useRadioButtonStore = create<RadioButtonStore>((set, get) => ({
  radioButtonStyles: defaultRadioButtonStyles,
  setRadioButtonStyles: (config) => {
    set((state) => {
      const updatedStyles = {
        ...state.radioButtonStyles,
        ...config,
      };

      const hasChange =
        JSON.stringify(state.radioButtonStyles) !==
        JSON.stringify(updatedStyles);

      if (hasChange) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState()
            .currentlyDisplayingStyleGuide?.styleguideId;

        if (userId && styleGuideId) {
          debouncedFunctions.radiobuttons(
            updatedStyles,
            userId,
            styleGuideId.toString()
          );
        }

        return { radioButtonStyles: updatedStyles };
      }
      return state;
    });
  },
  getRadioButtonStyles: () => get().radioButtonStyles,
  resetRadioButtonStyles: () =>
    set({ radioButtonStyles: defaultRadioButtonStyles }),
}));
