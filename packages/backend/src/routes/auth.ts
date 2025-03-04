import { Hono } from "hono";
import {
  getUser,
  kindeClient,
  sessionManager,
} from "../services/kinde.service";

const connectionId = process.env.KINDE_EMAIL_CONN_ID!;
export const authRouter = new Hono()
  .get("/login/:loginHint", async (c) => {
    const { loginHint } = c.req.param();
    const loginUrl = await kindeClient.login(sessionManager(c), {
      authUrlParams: { connection_id: connectionId, login_hint: loginHint },
    });

    return c.redirect(loginUrl.toString());
  })
  .get("/register/:loginHint", async (c) => {
    const { loginHint } = c.req.param();
    const registerUrl = await kindeClient.register(sessionManager(c), {
      authUrlParams: {
        connection_id: connectionId,
        login_hint: loginHint,
      },
    });

    return c.redirect(registerUrl.toString());
  })
  .get("/callback", async (c) => {
    const url = new URL(c.req.url);
    await kindeClient.handleRedirectToApp(sessionManager(c), url);
    return c.redirect("/dashboard");
  })
  .get("/logout", async (c) => {
    const logoutUrl = await kindeClient.logout(sessionManager(c));
    return c.redirect(logoutUrl);
  })
  .get("/me", getUser, async (c) => {
    const user = c.var.dbUser;

    return c.json({ user });
  });
