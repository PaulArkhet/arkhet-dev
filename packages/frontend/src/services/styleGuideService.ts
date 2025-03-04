import axios from "axios";
import { toast } from "../hooks/use-toast";
import { buttonStyles } from "../store/useButtonStore";
import { RadioButtonStyleConfig } from "../store/useRadioButtonStore";
import { TextFieldStyleConfig } from "../store/useTextFieldStore";
import { ToggleStyleConfig } from "../store/useToggleStore";
import { CheckBoxStyleConfig } from "../store/useCheckBoxStore";
import { InternalNavigationStyleConfig } from "../store/useInternalNavigationStore";
import { SegmentedButtonStyleConfig } from "../store/useSegmentedButtonStore";
import { CardStyleConfig } from "../store/useCardStore";
import { LoadingState } from "../utils/helpers";
import debounce from "debounce";

export interface StyleGuideData {
  filename: string;
  typography: string;
  buttons: buttonStyles;
  radiobuttons: RadioButtonStyleConfig;
  textfields: TextFieldStyleConfig;
  toggle: ToggleStyleConfig;
  checkboxes: CheckBoxStyleConfig;
  internalnavigation: InternalNavigationStyleConfig;
  segmentedbutton: SegmentedButtonStyleConfig;
  card: CardStyleConfig;
  user_id: string;
}

export async function saveStyleGuide(
  styleGuideData: StyleGuideData,
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>
) {
  try {
    const token = localStorage.getItem("jwt_access_token");

    if (!token) {
      console.error("No token found");
      toast({
        title: "Error",
        description: "No authentication token found. Please login again.",
        variant: "destructive",
        duration: 5000,
      });

      setLoading((prev) => ({ ...prev, styleGuideName: false }));
      return;
    }

    const response = await axios.post(`/api/v0/styleguides/`, styleGuideData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log("Style guide saved successfully:", response.data.content);

      setLoading((prev) => ({ ...prev, styleGuideName: false }));

      return response.data.content;
    }
  } catch (error) {
    console.error("Error saving style guide:", error);
    toast({
      title: "Error",
      description: "Failed to save the style guide.",
      variant: "destructive",
      duration: 5000,
    });
  }
}

export async function loadStyleGuide(
  userId: string,
  styleGuideId?: "latest" | string
) {
  try {
    if (styleGuideId === "latest") {
      const response = await axios.get(
        `/api/v0/styleguides/user/${userId}/latest`
      );

      if (response.data.success) {
        return response.data.content;
      } else {
        console.error("Failed to fetch style guide:", response.data.message);
        return null;
      }
    }
    if (styleGuideId && styleGuideId !== "latest") {
      const response = await axios.get(
        `/api/v0/styleguides/styleguide/${styleGuideId}/user/${userId}`
      );

      if (response.data.success) {
        return response.data.content;
      } else {
        console.error("Failed to fetch style guide:", response.data.message);
        return null;
      }
    } else {
      const response = await axios.get(`/api/v0/styleguides/user/${userId}`);
      if (response.data.success) {
        return response.data.content;
      } else {
        console.error("Failed to fetch style guide:", response.data.message);
        return null;
      }
    }
  } catch (error) {
    console.error("Error fetching style guide:", error);
    return null;
  }
}

export async function getStyleGuideFilenames(userId: string) {
  try {
    const response = await axios.get(
      `/api/v0/styleguides/user/${userId}/filenames`
    );

    if (response.data.success) {
      return response.data.content;
    } else {
      console.error("Failed to fetch style guide:", response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching style guide:", error);
    return null;
  }
}

export async function deleteStyleGuideById(
  userId: string,
  styleGuideId: string
) {
  try {
    const response = await axios.delete(
      `/api/v0/styleguides/styleguide/${styleGuideId}/user/${userId}`
    );

    if (response.data.success) {
      return response.data.message;
    } else {
      console.error("Failed to fetch style guide:", response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching style guide:", error);
    return null;
  }
}

export async function updateStyledComponentDatabase(
  componentType: keyof StyleGuideData,
  updatedStyles: StyleGuideData[keyof StyleGuideData],
  userId: string,
  styleGuideId: string
) {
  try {
    console.log("Updated styles:", updatedStyles);
    console.log("Component type:", componentType);
    console.log("User ID:", userId);
    console.log("Style guide ID:", styleGuideId);

    const response = await axios.put(
      `/api/v0/styleguides/styleguide/${styleGuideId}/user/${userId}`,
      {
        componentType,
        updatedStyles,
      }
    );

    if (response.data.success) {
      console.log(
        `Updated ${componentType} styles successfully:`,
        response.data.content
      );
    } else {
      console.error(
        `Failed to update ${componentType} styles:`,
        response.data.message
      );
    }
  } catch (error) {
    console.log(error);
  }
}

const createDebouncedFunction = (componentType: keyof StyleGuideData) =>
  debounce(
    async (
      updatedStyles: StyleGuideData[keyof StyleGuideData],
      userId: string,
      styleGuideId: string
    ) => {
      await updateStyledComponentDatabase(
        componentType,
        updatedStyles,
        userId,
        styleGuideId
      );
    },
    10000
  );

export const debouncedFunctions = {
  typography: createDebouncedFunction("typography"),
  buttons: createDebouncedFunction("buttons"),
  radiobuttons: createDebouncedFunction("radiobuttons"),
  textfields: createDebouncedFunction("textfields"),
  toggle: createDebouncedFunction("toggle"),
  checkboxes: createDebouncedFunction("checkboxes"),
  internalnavigation: createDebouncedFunction("internalnavigation"),
  segmentedbutton: createDebouncedFunction("segmentedbutton"),
  card: createDebouncedFunction("card"),
};
