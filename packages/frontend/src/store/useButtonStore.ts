import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export type ButtonType = "primary" | "secondary" | "outlined" | "ghost" | "";

export interface ButtonStyleConfig {
  color?: string;
  textColor: string;
  fontSize: string;
  borderRadius: string;
  paddingRight: string;
  paddingLeft: string;
  paddingTop: string;
  paddingBottom: string;
  borderColor: string;
  borderWidth: string;
  backgroundColor: string;
  hoveredBackgroundColor: string;
  hoveredTextColor: string;
  isHovered: boolean;
}

export interface buttonStyles {
  primary: ButtonStyleConfig;
  secondary: ButtonStyleConfig;
  outlined: ButtonStyleConfig;
  ghost: ButtonStyleConfig;
}

interface ButtonStore {
  buttonType: ButtonType;
  setButtonType: (type: ButtonType) => void;
  buttonStyles: buttonStyles;
  setButtonStyles: (
    type: keyof buttonStyles,
    config: Partial<ButtonStyleConfig>
  ) => void;
  getButtonStyles: (type: keyof buttonStyles) => ButtonStyleConfig;
  resetButtonStyles: () => void;
}

const defaultButtonStyles: buttonStyles = {
  primary: {
    textColor: "black",
    fontSize: "11px",
    borderRadius: "20px",
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingRight: "20px",
    paddingLeft: "20px",
    borderColor: "",
    borderWidth: "0px",
    backgroundColor: "#D4A84F",
    hoveredBackgroundColor: "#c49842",
    hoveredTextColor: "black",
    isHovered: false,
  },
  secondary: {
    textColor: "white",
    fontSize: "11px",
    borderRadius: "20px",
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingRight: "20px",
    paddingLeft: "20px",
    borderColor: "",
    borderWidth: "0px",
    backgroundColor: "#005B69",
    hoveredBackgroundColor: "#004C59",
    hoveredTextColor: "white",
    isHovered: false,
  },
  outlined: {
    textColor: "#D4A84F",
    fontSize: "11px",
    borderRadius: "20px",
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingRight: "20px",
    paddingLeft: "20px",
    borderColor: "#D4A84F",
    borderWidth: "2px",
    backgroundColor: "transparent",
    hoveredBackgroundColor: "#303030",
    hoveredTextColor: "#D4A84F",
    isHovered: false,
  },
  ghost: {
    textColor: "#D4A84F",
    fontSize: "11px",
    borderRadius: "20px",
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingRight: "20px",
    paddingLeft: "20px",
    borderColor: "transparent",
    borderWidth: "1px",
    backgroundColor: "transparent",
    hoveredBackgroundColor: "#303030",
    hoveredTextColor: "#D4A84F",
    isHovered: false,
  },
};

export const useButtonStore = create<ButtonStore>((set, get) => ({
  buttonType: "",
  setButtonType: (type) => set({ buttonType: type }),

  buttonStyles: defaultButtonStyles,

  setButtonStyles: (type, config) => {
    set((state) => {
      const updatedStyle = { ...state.buttonStyles[type], ...config };

      const fullUpdatedButtonStyles = {
        ...state.buttonStyles,
        [type]: updatedStyle,
      };

      const hasChange =
        JSON.stringify(state.buttonStyles) !==
        JSON.stringify(fullUpdatedButtonStyles);

      if (hasChange) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState()
            .currentlyDisplayingStyleGuide?.styleguide_id;

        if (userId && styleGuideId) {
          debouncedFunctions.buttons(
            fullUpdatedButtonStyles,
            userId,
            styleGuideId
          );
        }
        return {
          buttonStyles: {
            ...state.buttonStyles,
            [type]: updatedStyle,
          },
        };
      }
      return state;
    });
  },

  getButtonStyles: (type) => get().buttonStyles[type],
  resetButtonStyles: () => set({ buttonStyles: defaultButtonStyles }),
}));
