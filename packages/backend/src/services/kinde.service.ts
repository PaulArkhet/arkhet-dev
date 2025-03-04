import { z } from "zod";
import {
  createKindeServerClient,
  GrantType,
  type SessionManager,
  type UserType,
} from "@kinde-oss/kinde-typescript-sdk";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { mightFail } from "might-fail";
import { users as usersTable } from "../../db/schemas/users";
import { db } from "../../db/db";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { createStyleGuide } from "./styleguide.service";
import { styleguideCreateArgsParser } from "./styleguide.service";

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_ISSUER_URL!,
    clientId: process.env.KINDE_CLIENT_ID!,
    clientSecret: process.env.KINDE_CLIENT_SECRET!,
    redirectURL: `${process.env.APP_URL!}/api/v0/auth/callback`,
    logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URL!,
  }
);

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key);
    return result;
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    } as const;
    if (typeof value === "string") {
      setCookie(c, key, value, cookieOptions);
    } else {
      setCookie(c, key, JSON.stringify(value), cookieOptions);
    }
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key);
  },
  async destroySession() {
    [
      "ac-state-key",
      "id_token",
      "access_token",
      "user",
      "refresh_token",
    ].forEach((key) => {
      deleteCookie(c, key);
    });
  },
});

type Env = {
  Variables: {
    kindeUser: UserType;
    dbUser: InferSelectModel<typeof usersTable>;
  };
};

export const getUser = createMiddleware<Env>(async (c, next) => {
  try {
    const manager = sessionManager(c);
    const isAuthenticated = await kindeClient.isAuthenticated(manager);
    if (!isAuthenticated) {
      throw new Error("Not authenticated"); // catch will consolidate the error
    }
    const kindeUser = await kindeClient.getUserProfile(manager);

    const { result: userQueryResult, error: userQueryError } = await mightFail(
      db.select().from(usersTable).where(eq(usersTable.userId, kindeUser.id))
    );

    if (userQueryError) {
      throw userQueryError;
    }

    c.set("kindeUser", kindeUser);

    if (userQueryResult.length === 0) {
      const { result: insertResult, error: insertError } = await mightFail(
        db
          .insert(usersTable)
          .values({
            userId: kindeUser.id,
            email: kindeUser.email,
            username: kindeUser.given_name,
            profilePictureSrc: kindeUser.picture,
          } as InferInsertModel<typeof usersTable>)
          .returning()
      );

      if (insertError) {
        throw insertError;
      }

      const userId = insertResult[0].userId;
      await createDefaultStyleguide(userId);

      c.set("dbUser", insertResult[0]);
    } else {
      c.set("dbUser", userQueryResult[0]);
    }

    await next();
  } catch (e) {
    throw new HTTPException(401, { message: "Unauthorized", cause: e });
  }
});

async function createDefaultStyleguide(userId: string) {
  const createStyleguideArgs: z.infer<typeof styleguideCreateArgsParser> = {
    primaryColor: "#F1B000",
    secondaryColorStyles: {
      firstColor: "#232F34",
      secondColor: "#125FCA",
    },
    neutralColorStyles: {
      firstColor: "#D9D9D9",
      secondColor: "#303030",
      thirdColor: "#FFFFFF",
    },
    typographyStyles: {
      customizationEnabledFont: false,
      selectedFont: "Roboto",
      h1Size: "26px",
      h2Size: "24px",
      h3Size: "23px",
      h4Size: "20px",
      h5Size: "16px",
      h6Size: "14px",
      paragraphSize: "14px",
      linkSize: "14px",
      h1Weight: "700",
      h2Weight: "600",
      h3Weight: "500",
      h4Weight: "500",
      h5Weight: "400",
      h6Weight: "400",
      paragraphWeight: "400",
      linkWeight: "400",
    },
    toggleStyles: {
      isChecked: false,
      checkedBackgroundColor: "#ECC06C",
      uncheckedBackgroundColor: "rgba(48, 54, 55, 0.5)",
      checkedButtonColor: "#412D00",
      uncheckedButtonColor: "#8C9388",
      checkedBorderColor: "#ECC06C",
      uncheckedBorderColor: "#8C9388",
      checkedThumbSize: "16px",
      uncheckedThumbSize: "12px",
      borderRadius: "20px",
      styleJSON: JSON.stringify({ height: "24px", width: "40px" }),
    },
    textFieldStyles: {
      inputStylePadding: "10px",
      inputStyleBorderWidth: "1px",
      inputStyleBorderColor: "gray",
      inputStyleBorderStyle: "solid",
      inputStyleBorderRadius: "8px",
      inputStylePosition: "relative",
      inputStyleBackgroundColor: "transparent",
      inputStyleClearable: true,
      inputStyleBorderColorChecked: "#D9BF77",
      labelStylePosition: "absolute",
      labelStyleBackgroundColor: "#27272a",
      labelStyleZIndex: "10",
      labelStyleMarginTop: "-10px",
      labelStyleMarginLeft: "12px",
      labelStylePadding: "2px 4px",
      supportingTextStyleFontSize: "11px",
      supportingTextStyleColor: "gray",
    },
    segmentedButtonStyles: {
      buttonLabel: [
        {
          label: "First",
        },
        {
          label: "Second",
        },
        {
          label: "Third",
        },
        { label: "Fourth" },
      ],
      activeBgColor: "#004d61",
      inactiveBgColor: "#242424",
      activeTextColor: "#b8eaff",
      inactiveTextColor: "#dee3e5",
      borderColor: "#8c9388",
      hoverBgColor: "#343335",
    },
    radioButtonStyles: {
      height: "24px",
      width: "24px",
      borderColor: "#D4A84F",
      borderWidth: "4px",
      borderRadius: "50%",
      borderColorChecked: "#D4A84F",
      color: "#D4A84F",
      customIconHeight: "8px",
      customIconWidth: "8px",
      customIconBackgroundColor: "#D4A84F",
      customIconBorderRadius: "50%",
    },
    internalNavigationStyles: {
      internalBorderBottom: "1px solid #303637",
      internalBorderRadius: "0px",
      internalPaddingBottom: "4px",
      activeColor: "#ECC06C",
      activeTextDecoration: "",
      activeTextDecorationThickness: "",
      activeMarginBottom: "-4px",
      activeTextDecorationOffset: "9px",
      activeBorderBottom: "4px solid #ECC06C",
    },
    checkboxStyles: {
      backgroundColor: "transparent",
      border: "2px solid #DEE3E5",
      height: "20px",
      width: "20px",
      cursor: "pointer",
      borderRadius: "5px",
      checkedBorder: "none",
      checkedColor: "#412D00",
      checkedBackgroundColor: "#ECC06C",
      checkedAlternateBorder: "none",
      checkedAlternateColor: "#412D00",
      checkedAlternateBackgroundColor: "#E7CD9A",
    },
    cardStyles: {
      backgroundColor: "#171D1E",
      borderRadius: "10px",
      border: "0px solid transparent",
      hoveredBackgroundColor: "#303030",
      color: "#F1B000",
      textColor: "#D9D9D9",
      mainCardPicture: true,
      mainCardButton: true,
      subCardPicture: true,
      listCardBorderRadius: "0px",
      listBackgroundColor: "#171D1E",
      listTextColor: "#D9D9D9",
      listColor: "#F1B000",
      listBorderRadius: "0px",
      listShowAvatar: true,
      listShowCheckbox: true,
      listWidth: "300px",
    },
    buttonGhost: {
      textColor: "#D4A84F",
      fontSize: "11px",
      borderRadius: "20px",
      paddingTop: "18px",
      paddingBottom: "18px",
      paddingRight: "20px",
      paddingLeft: "20px",
      borderColor: "transparent",
      borderWidth: "1px",
      backgroundColor: "transparent",
      hoveredBackgroundColor: "#303030",
      hoveredTextColor: "#D4A84F",
      isHovered: false,
    },
    buttonTertiary: {
      textColor: "#D4A84F",
      fontSize: "11px",
      borderRadius: "20px",
      paddingTop: "18px",
      paddingBottom: "18px",
      paddingRight: "20px",
      paddingLeft: "20px",
      borderColor: "#D4A84F",
      borderWidth: "2px",
      backgroundColor: "transparent",
      hoveredBackgroundColor: "#303030",
      hoveredTextColor: "#D4A84F",
      isHovered: false,
    },
    buttonSecondary: {
      textColor: "white",
      fontSize: "11px",
      borderRadius: "20px",
      paddingTop: "18px",
      paddingBottom: "18px",
      paddingRight: "20px",
      paddingLeft: "20px",
      borderColor: "",
      borderWidth: "0px",
      backgroundColor: "#005B69",
      hoveredBackgroundColor: "#004C59",
      hoveredTextColor: "white",
      isHovered: false,
    },
    buttonPrimary: {
      textColor: "black",
      fontSize: "11px",
      borderRadius: "20px",
      paddingTop: "18px",
      paddingBottom: "18px",
      paddingRight: "20px",
      paddingLeft: "20px",
      borderColor: "",
      borderWidth: "0px",
      backgroundColor: "#D4A84F",
      hoveredBackgroundColor: "#c49842",
      hoveredTextColor: "black",
      isHovered: false,
    },
    userId,
  };
  /*
   * */

  const { result, error } = await mightFail(
    createStyleGuide(createStyleguideArgs, userId)
  );

  if (error) {
    console.error("Error while initializing user", error);
    throw error;
  }

  return result;
}
