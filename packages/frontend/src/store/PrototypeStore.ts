import { Prototype } from "@backend/db/schemas/prototypes";
import { create } from "zustand";

const prototypeStore = create<{
  code: string | null;
  setCode: (code: string | null) => void;
  currentPrototype: Prototype | null;
  setCurrentPrototype: (arg: Prototype | null) => void;
  isPrototypeReady: boolean;
  setIsPrototypeReady: (isReady: boolean) => void;
  currentPrototypes: Prototype[] | null;
  setCurrentPrototypes: (arg: Prototype[]) => void;
}>((set, _) => ({
  code: null,
  setCode: (code: string | null) => set({ code }),
  currentPrototype: null,
  setCurrentPrototype: (arg: Prototype | null) =>
    set({ currentPrototype: arg }),
  isPrototypeReady: true,
  setIsPrototypeReady: (isReady: boolean) => set({ isPrototypeReady: isReady }),
  currentPrototypes: null,
  setCurrentPrototypes: (arg: Prototype[]) => set({ currentPrototypes: arg }),
}));

export default prototypeStore;
