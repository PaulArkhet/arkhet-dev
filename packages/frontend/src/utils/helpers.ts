import { MutableRefObject } from "react";

export function capitalizeText(
  text: string,
  capitalizeAll: boolean = false
): string {
  if (!text) return "";
  return capitalizeAll
    ? text.toUpperCase()
    : text.charAt(0).toUpperCase() + text.slice(1);
}

export function removePx(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return parseInt(value.replace("px", ""), 10);
}

export function capitalizeFontFamily(fontFamily: string): string {
  if (!fontFamily) return "";
  return fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1).toLowerCase();
}

export function removeFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return filename.substring(0, lastDotIndex);
  }
  return filename;
}

export interface LoadingState {
  styleGuideName: boolean;
  typography: boolean;
  color: boolean;
  button: boolean;
  radioButton: boolean;
  textField: boolean;
  toggle: boolean;
  checkBox: boolean;
  internalNavigation: boolean;
  segmentedButton: boolean;
  card: boolean;
  list: boolean;
}

export const resetAllLoading = (
  loading: LoadingState,
  option: boolean
): LoadingState => {
  const newState: LoadingState = {} as LoadingState;

  if (option) {
    Object.keys(loading).forEach((key) => {
      newState[key as keyof LoadingState] = true;
    });
    return newState;
  }

  Object.keys(loading).forEach((key) => {
    newState[key as keyof LoadingState] = false;
  });
  return newState;
};

export function getCurrentViewCenter(
  canvasRef: MutableRefObject<HTMLDivElement | null>
): { x: number; y: number } {
  if (!canvasRef.current) {
    console.warn("Canvas reference is not set yet.");
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  const canvasRect = canvasRef.current.getBoundingClientRect();

  const viewportCenterY = window.scrollY + window.innerHeight / 2;
  const viewportCenterX = window.scrollX + window.innerWidth / 2;

  const centerXRelativeToCanvas = viewportCenterX - canvasRect.left;
  const centerYRelativeToCanvas = viewportCenterY - canvasRect.top;

  const result = {
    x: centerXRelativeToCanvas,
    y: centerYRelativeToCanvas,
  };
  return result;
}
