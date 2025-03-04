import { create } from "zustand";

interface DesignSystemScreenshotStore {
  base64Screenshot: string | null;
  setBase64Screenshot: (screenshot: string) => void;
}

export const useDesignSystemScreenshotStore =
  create<DesignSystemScreenshotStore>((set) => ({
    base64Screenshot: null,
    setBase64Screenshot(screenshot: string) {
      set((state) => {
        state.base64Screenshot = screenshot;
        return state;
      });
    },
  }));
