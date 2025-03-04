import { StyleguideWithJoins } from "@backend/src/services/styleguide.service";
import { create } from "zustand";

type TypographyStylesKey = keyof StyleguideWithJoins["typographyStyles"];

export function getSizeKeys(activeHeader: ActiveHeaderOptions) {
  if (activeHeader === "none") return;

  const sizeKey: TypographyStylesKey = `${activeHeader}Size`;
  const weightKey: TypographyStylesKey = `${activeHeader}Weight`;

  return { sizeKey, weightKey };
}

export function getHeaderProperties(
  activeHeader: ActiveHeaderOptions,
  styleguide: StyleguideWithJoins
) {
  if (activeHeader === "none") return { size: "0px", weight: "0px" };
  const sizeKey: TypographyStylesKey = `${activeHeader}Size`;
  const weightKey: TypographyStylesKey = `${activeHeader}Weight`;

  const size = styleguide.typographyStyles[sizeKey];
  const weight = styleguide.typographyStyles[weightKey];

  return { size, weight };
}

export type ActiveHeaderOptions =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "paragraph"
  | "link"
  | "none";

export const headers = [
  { key: "h1", label: "Header 1" },
  { key: "h2", label: "Header 2" },
  { key: "h3", label: "Header 3" },
  { key: "h4", label: "Header 4" },
  { key: "h5", label: "Header 5" },
  { key: "h6", label: "Header 6" },
  { key: "paragraph", label: "Paragraph" },
  { key: "link", label: "Link" },
] as const;

interface TypographyStore {
  activeHeader: ActiveHeaderOptions;
  updateActiveHeader: (option: ActiveHeaderOptions) => void;
}

export const useTypographyStore = create<TypographyStore>((set) => ({
  activeHeader: "h1",
  updateActiveHeader: (value: ActiveHeaderOptions) => {
    set({ activeHeader: value });
  },
}));
