import { ButtonStyleConfig } from "../store/useButtonStore";

type ButtonAction =
    | { type: "SET_FONT_SIZE"; payload: number }
    | { type: "SET_BORDER_RADIUS"; payload: number }
    | { type: "SET_PADDING_X"; payload: number }
    | { type: "SET_PADDING_Y"; payload: number };

export const buttonReducer = (
    state: Partial<ButtonStyleConfig>,
    action: ButtonAction
) => {
    switch (action.type) {
        case "SET_FONT_SIZE":
            const updatedStateWithFontSize = {
                ...state,
                fontSize: `${action.payload}px`,
            };
          
            return updatedStateWithFontSize;
        case "SET_BORDER_RADIUS":
            const updatedStateWithBorderRadius = {
                ...state,
                borderRadius: `${action.payload}px`,
            };
            return updatedStateWithBorderRadius;
        case "SET_PADDING_X":
            return {
                ...state,
                paddingRight: `${action.payload}px`,
                paddingLeft: `${action.payload}px`,
            };
        case "SET_PADDING_Y":
            return {
                ...state,
                paddingTop: `${action.payload}px`,
                paddingBottom: `${action.payload}px`,
            };
        default:
            return state;
    }
};
