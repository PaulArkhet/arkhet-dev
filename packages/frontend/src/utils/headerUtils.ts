// utils/headerUtils.ts

// Map headers to display-friendly names
export const headerDisplayNames: Record<string, string> = {
  h1: "Header 1",
  h2: "Header 2",
  h3: "Header 3",
  h4: "Header 4",
  h5: "Header 5",
  h6: "Header 6",
  paragraph: "Paragraph",
  link: "Link",
};

// Function to get display-friendly name or default to original key
export function getHeaderDisplayName(headerKey: string): string {
  return headerDisplayNames[headerKey] || headerKey;
}

export const fontWeights = {
  Light: "300",
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
};

export const fontSizeRanges = {
  h1: { min: 32, max: 48 },
  h2: { min: 24, max: 36 },
  h3: { min: 20, max: 30 },
  h4: { min: 18, max: 26 },
  h5: { min: 16, max: 22 },
  h6: { min: 14, max: 20 },
  paragraph: { min: 14, max: 18 },
  link: { min: 14, max: 18 },
};
