import WebFont from "webfontloader";

type FontFamilies = string[];

export const loadFonts = (fonts: FontFamilies) => {
  WebFont.load({
    google: {
      families: fonts,
    },
  });
};

export const fontSizes = [
  "8px",
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
  "56px",
  "64px",
];
