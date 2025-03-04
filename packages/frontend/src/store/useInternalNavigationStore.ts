import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { useUploadedStyleGuideStore } from "./useUploadedStyleGuideStore";
import { debouncedFunctions } from "../services/styleGuideService";

export interface InternalNavigationStyleConfig {
  internal: {
    borderBottom: string;
    borderRadius: string;
    paddingBottom: string;
  };
  active: {
    color: string;
    textDecoration: string;
    textDecorationThickness: string;
    marginBottom: string;
    textDecorationOffset: string;
    borderBottom: string;
  };
}

interface useInternalNavigationStore {
  InternalNavigationStyles: InternalNavigationStyleConfig;
  setInternalNavigationStyles: (
    internalStyles: Partial<InternalNavigationStyleConfig["internal"]>,
    activeStyles: Partial<InternalNavigationStyleConfig["active"]>
  ) => void;
  customizationEnabledInternalNavigation: boolean;
  setCustomizationInternalNavigation: (enabled: boolean) => void;
  resetInternalNavigationStyles: () => void;
}

const defaultInternalNavigationStyles: InternalNavigationStyleConfig = {
  internal: {
    borderBottom: "1px solid #303637",
    borderRadius: "0px",
    paddingBottom: "4px",
  },
  active: {
    color: "#ECC06C",
    textDecoration: "",
    textDecorationThickness: "",
    marginBottom: "-4px",
    textDecorationOffset: "9px",
    borderBottom: "4px solid #ECC06C",
  },
};

export const useInternalNavigationStore = create<useInternalNavigationStore>(
  (set) => ({
    InternalNavigationStyles: defaultInternalNavigationStyles,

    setInternalNavigationStyles: (internalStyles, activeStyles) =>
      set((state) => {
        const updatedStyles = {
          internal: {
            ...state.InternalNavigationStyles.internal,
            ...internalStyles,
          },
          active: {
            ...state.InternalNavigationStyles.active,
            ...activeStyles,
          },
        };

        const hasChange =
          JSON.stringify(updatedStyles) !==
          JSON.stringify(state.InternalNavigationStyles);

        if (hasChange) {
          const userId = useAuthStore.getState().user?.user_id;
          const styleGuideId =
            useUploadedStyleGuideStore.getState()
              .currentlyDisplayingStyleGuide?.styleguide_id;

          if (userId && styleGuideId) {
            debouncedFunctions.internalnavigation(
              updatedStyles,
              userId,
              styleGuideId
            );
          }

          return { InternalNavigationStyles: updatedStyles };
        }
        return state;
      }),
    customizationEnabledInternalNavigation: false,
    setCustomizationInternalNavigation: (enabled) =>
      set({ customizationEnabledInternalNavigation: enabled }),
    resetInternalNavigationStyles: () =>
      set({ InternalNavigationStyles: defaultInternalNavigationStyles }),
  })
);
