import { create } from "zustand";
import { checkIconNames } from "../components/design-system/components/CheckIcons";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface CheckBoxStyleConfig {
  checkboxBaseStyles: {
    backgroundColor: string;
    border: string;
    height: string;
    width: string;
    cursor: string;
    borderRadius: string;
  };
  checkedStyles: {
    border: string;
    color: string;
    backgroundColor: string;
  };
  checkedAlternateStyles: {
    border: string;
    color: string;
    backgroundColor: string;
  };
}

interface CheckBoxStore {
  checkBoxStyling: CheckBoxStyleConfig;
  setCheckBoxStyling: (styles: Partial<CheckBoxStyleConfig>) => void;
  customizationEnabledCheckBox: boolean;
  setCustomizationCheckBox: (enabled: boolean) => void;
  checkBoxCustomIcon: checkIconNames;
  setCheckBoxCustomIcon: (checkBoxCustomIcon: checkIconNames) => void;
  resetCheckBoxStyling: () => void;
}

const defaultCheckBoxStyling: CheckBoxStyleConfig = {
  checkboxBaseStyles: {
    backgroundColor: "transparent",
    border: "2px solid #DEE3E5",
    height: "20px",
    width: "20px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  checkedStyles: {
    border: "none",
    color: "#412D00",
    backgroundColor: "#ECC06C",
  },
  checkedAlternateStyles: {
    border: "none",
    color: "#412D00",
    backgroundColor: "#E7CD9A",
  },
};

export const useCheckBoxStore = create<CheckBoxStore>((set) => ({
  checkBoxStyling: defaultCheckBoxStyling,

  setCheckBoxStyling: (styles) =>
    set((state) => {
      const updatedStyles = {
        ...state.checkBoxStyling,
        ...styles,
      };

      const hasChange =
        JSON.stringify(state.checkBoxStyling) !== JSON.stringify(updatedStyles);

      if (hasChange) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState().currentlyDisplayingStyleGuide
            ?.styleguideId;

        if (userId && styleGuideId) {
          debouncedFunctions.checkboxes(
            updatedStyles,
            userId,
            styleGuideId.toString()
          );
        }

        return { checkBoxStyling: updatedStyles };
      }
      return state;
    }),

  customizationEnabledCheckBox: false,
  setCustomizationCheckBox: (enabled) =>
    set({ customizationEnabledCheckBox: enabled }),
  checkBoxCustomIcon: "Straight",
  setCheckBoxCustomIcon: (checkBoxCustomIcon) => set({ checkBoxCustomIcon }),
  resetCheckBoxStyling: () => set({ checkBoxStyling: defaultCheckBoxStyling }),
}));
