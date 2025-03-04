import { create } from "zustand";

const useDashboardStore = create<{
  loadingProject: boolean;
  setLoadingProject: (args: boolean) => void;
}>((set, _) => ({
  loadingProject: false,
  setLoadingProject: (args: boolean) => set({ loadingProject: args }),
}));

export default useDashboardStore;
