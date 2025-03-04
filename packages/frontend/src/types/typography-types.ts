type FontStyles = {
  size: string;
  weight: string;
};

type TypographyElements = {
  "H1": FontStyles;
  "H2": FontStyles;
  "H3": FontStyles;
  "H4": FontStyles;
  "H5": FontStyles;
  "H6": FontStyles;
  Paragraph: FontStyles;
  Link: FontStyles;
};

type TypographyElementKey = keyof TypographyElements | "";

interface Font {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: { [key: string]: string };
  category: string;
  kind: string;
  menu: string;
}

interface FontsApiResponse {
  items: Font[];
}

export type {
  FontsApiResponse,
  Font,
  FontStyles,
  TypographyElements,
  TypographyElementKey,
};
