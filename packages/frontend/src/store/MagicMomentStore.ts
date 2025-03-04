import { create } from "zustand";

const useMagicMomentStore = create<{
  progress: number;
  setProgress: (progress: number | ((prev: number) => number)) => void;
}>((set) => ({
  progress: 0,
  setProgress: (progress) =>
    set((state) => ({
      progress:
        typeof progress === "function" ? progress(state.progress) : progress,
    })),
}));

export default useMagicMomentStore;
