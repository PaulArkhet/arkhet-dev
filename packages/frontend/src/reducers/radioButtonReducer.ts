import { RadioButtonStyleConfig } from "@/types/button-types";

type RadioButtonAction =
  | { type: "SET_HEIGHT"; payload: number }
  | { type: "SET_WIDTH"; payload: number }
  | { type: "SET_BORDER_WIDTH"; payload: number };

export const radioButtonReducer = (
  state: Partial<RadioButtonStyleConfig>,
  action: RadioButtonAction
) => {
  switch (action.type) {
    case "SET_HEIGHT":
      return { ...state, height: `${action.payload}px` };
    case "SET_WIDTH":
      return { ...state, width: `${action.payload}px` };
    case "SET_BORDER_WIDTH":
      return { ...state, borderWidth: `${action.payload}px` };
    default:
      return state;
  }
};
