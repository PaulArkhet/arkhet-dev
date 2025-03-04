import { Project } from "@backend/db/schemas/projects";
import { create } from "zustand";

const useProjectStore = create<{
  project: Project | null;
  setProject: (project: Project | null) => void;
}>((set, _) => ({
  project: null,
  setProject: (project: Project | null) => set({ project }),
}));

export default useProjectStore;
