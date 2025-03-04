import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface CardStyleConfig {
  backgroundColor: string;
  borderRadius: string;
  border: string;
  hoveredBackgroundColor: string;
  color: string;
  textColor: string;
  mainCard: {
    picture: boolean;
    button: boolean;
  };
  subCard: {
    picture: boolean;
  };
  listCard: { borderRadius: string };
  list: {
    backgroundColor: string;
    textColor: string;
    color: string;
    borderRadius: string;
    showAvatar: boolean;
    showCheckbox: boolean;
    width: string;
  };
}

interface useCardStore {
  cardStyles: CardStyleConfig;
  setCardStyles: (styles: Partial<CardStyleConfig>) => void;
  customizationEnabledCard: boolean;
  setCustomizationEnabledCard: (enabled: boolean) => void;
  resetCardStyles: () => void;
}

const defaultCardStyles: CardStyleConfig = {
  backgroundColor: "#171D1E",
  borderRadius: "10px",
  border: "0px solid transparent",
  hoveredBackgroundColor: "#303030",
  color: "#F1B000",
  textColor: "#D9D9D9",
  mainCard: {
    picture: true,
    button: true,
  },
  subCard: {
    picture: true,
  },
  listCard: {
    borderRadius: "0px",
  },
  list: {
    backgroundColor: "#171D1E",
    textColor: "#D9D9D9",
    color: "#F1B000",
    borderRadius: "0px",
    showAvatar: true,
    showCheckbox: true,
    width: "300px",
  },
};

export const useCardStore = create<useCardStore>((set) => ({
  cardStyles: defaultCardStyles,

  setCardStyles: (styles) =>
    set((state) => {
      const updatedStyles = { ...state.cardStyles, ...styles };

      const hasChange =
        JSON.stringify(state.cardStyles) !==
        JSON.stringify(updatedStyles);

      if (hasChange) {
        const userId = useAuthStore.getState().user?.user_id;
        const styleGuideId =
          useUploadedStyleGuideStore.getState()
            .currentlyDisplayingStyleGuide?.styleguide_id;

        if (userId && styleGuideId) {
          debouncedFunctions.card(
            updatedStyles,
            userId!,
            styleGuideId!
          );
        }
        return {
          cardStyles: updatedStyles,
        };
      }
      return state;
    }),
  customizationEnabledCard: false,
  setCustomizationEnabledCard: (enabled) =>
    set({ customizationEnabledCard: enabled }),
  resetCardStyles: () => set({ cardStyles: defaultCardStyles }),
}));
