import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";
import { create } from "zustand";

export type ColorPaletteSelection =
  | { readonly _tag: keyof Pick<StyleguideWithJoins, "primaryColor"> }
  | {
    readonly _tag: keyof Pick<StyleguideWithJoins, "secondaryColorStyles">;
    readonly key: Exclude<
      keyof StyleguideWithJoins["secondaryColorStyles"],
      "id"
    >;
  }
  | {
    readonly _tag: keyof Pick<StyleguideWithJoins, "neutralColorStyles">;
    readonly key: Exclude<
      keyof StyleguideWithJoins["neutralColorStyles"],
      "id"
    >;
  }
  | { readonly _tag: "none" };

interface ColorPaletteStore {
  selection: ColorPaletteSelection;
  setActivePalette: (selection: ColorPaletteSelection) => void;
}

export const useColorPaletteStore = create<ColorPaletteStore>((set) => ({
  selection: { _tag: "none" },
  setActivePalette: (selection: ColorPaletteSelection) =>
    set(() => ({
      selection,
    })),
}));
