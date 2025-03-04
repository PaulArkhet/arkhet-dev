import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

interface CustomInputStyle extends React.CSSProperties {
  clearable?: boolean;
  borderColorChecked?: string;
}

export interface TextFieldStyleConfig {
  inputStyle: CustomInputStyle;
  labelStyle: React.CSSProperties;
  supportingTextStyle?: React.CSSProperties;
}

interface TextFieldStore {
  textFieldStyling: TextFieldStyleConfig;
  setTextFieldStyling: (styles: Partial<TextFieldStyleConfig>) => void;
  customizationEnabledTextField: boolean;
  setCustomizationTextField: (enabled: boolean) => void;
  resetTextFieldStyling: () => void;
}

const defaultTextFieldStyling: TextFieldStyleConfig = {
  inputStyle: {
    padding: "10px",
    borderWidth: "1px",
    borderColor: "gray",
    borderStyle: "solid",
    borderRadius: "8px",
    position: "relative",
    backgroundColor: "transparent",
    clearable: true,
    borderColorChecked: "#D9BF77",
  },
  labelStyle: {
    position: "absolute",
    backgroundColor: "#27272a",
    zIndex: 10,
    marginTop: "-10px",
    marginLeft: "12px",
    padding: "2px 4px",
  },
  supportingTextStyle: {
    fontSize: "11px",
    color: "gray",
  },
};

export const useTextFieldStore = create<TextFieldStore>((set) => ({
  textFieldStyling: defaultTextFieldStyling,

  setTextFieldStyling: (styles) =>
    set((state) => {
      const updatedStyles = { ...state.textFieldStyling, ...styles };

      const hasChanges =
        JSON.stringify(state.textFieldStyling) !==
        JSON.stringify(updatedStyles);

      if (hasChanges) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState()
            .currentlyDisplayingStyleGuide?.styleguide_id;

        if (userId && styleGuideId) {
          debouncedFunctions.textfields(
            updatedStyles,
            userId,
            styleGuideId
          );
        }
        return { textFieldStyling: updatedStyles };
      }
      return state;
    }),
  customizationEnabledTextField: false,
  setCustomizationTextField: (enabled) =>
    set({ customizationEnabledTextField: enabled }),

  resetTextFieldStyling: () =>
    set({ textFieldStyling: defaultTextFieldStyling }),
}));
