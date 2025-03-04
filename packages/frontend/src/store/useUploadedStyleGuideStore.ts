import { create } from "zustand";
import type { StyleguideWithJoins } from "@backend/src/services/styleguide.service";

interface UploadedStyleGuideStore {
  currentlyDisplayingStyleGuide: StyleguideWithJoins | null;
  updateCurrentlyDisplayingStyleGuide: (
    styleGuide: StyleguideWithJoins | null
  ) => void;
}

export const useUploadedStyleGuideStore = create<UploadedStyleGuideStore>(
  (set) => ({
    currentlyDisplayingStyleGuide: null,
    updateCurrentlyDisplayingStyleGuide: (
      styleGuide: StyleguideWithJoins | null
    ) => set({ currentlyDisplayingStyleGuide: styleGuide }),
  })
);
