import { Hono } from "hono";
import {
  getUser,
  kindeClient,
  sessionManager,
} from "../services/kinde.service";
import dotenv from "dotenv";
dotenv.config();

const betaUsers = [
  "callebe0@gmail.com",
  "mrdonaldtsang@gmail.com",
  "heenabakhtiani75@gmail.com",
  "eloisetbn@gmail.com",
  "markwilson1982@gmail.com",
  "amer@peak.studio",
  "leticia.serrano@iterateux.com",
  "mail.aditya16@gmail.com",
  "kat.nervez@gmail.com",
  "deepanshusaini.ee@gmail.com",
  "uxoxo.xyz@gmail.com",
  "jbedi7@gmail.com",
  "rjmoscardon@gmail.com",
  "naman6736@gmail.com",
  "rajanixd@gmail.com",
  "jenise.thompson@gmail.com",
  "josh@beanbonus.ca",
  "jasondbarrons@proton.me",
  "sam@askeldo.com",
  "ianmuirhead@gmail.com",
  "vijitsinghbhati@gmail.com",
  "jasonyang21656@gmail.com",
  "minm728@gmail.com",
  "ryanszyfer@gmail.com",
  "lee.cesafsky@gmail.com",
  "corafu48@gmail.com",
  "asingh44878@gmail.com",
  "chenjingle0525@gmail.com",
  "aritro.am@gmail.com",
  "sage@eqpmgr.com",
  "tylerbancroft@gmail.com",
  "pirouzhamidi.z@gmail.com",
  "uxmatt@hotmail.com",
  "eric.j.lee8@gmail.com",
  "amy.yosue.chen@gmail.com",
  "long2001yeung@gmail.com",
  "andy@andylam.design",
  "rohits87@gmail.com",
  "avikalp@vibinex.com",
  "jya1231@gmail.com",
  "catalin.malaescu@gmail.com",
  "bondesign@gmail.com",
  "madhu.desu@gmail.com",
  "kinhoreis2000@gmail.com",
  "dex@common-events.com",
  "sarim.khawaja@gmail.com",
  "jeffreyli730@gmail.com",
  "das.abhishek710@gmail.com",
  "jteng.designer@gmail.com",
  "madebysasha@icloud.com",
  "matthias.dyckerhoff@hey.com",
  "zoeyli46@gmail.com",
  "spkim0921@gmail.com",
  "paul@arkhet.com",
  "paulkim89.dev@gmail.com",
  "vitor@arkhet.com",
  "nate@arkhet.com",
  "steph@arkhet.com",
  "randall@arkhet.com",
  "david@arkhet.com",
  "huzaifa@arkhet.com",
  "jerry@arkhet.com",
  "ryan@arkhet.com",
  "luka@arkhet.com",
  "jason@arkhet.com",
  "angelina@arkhet.com",
  "byron@arkhet.com",
  "byrondray8@gmail.com",
  "dexalmonte12@gmail.com",
  "andrey.burkenya@gmail.com",
  "jeffreyli730@gmail.com",
  "grace.ty.jang@gmail.com",
  "rhiness@gmail.com",
];

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
    if (
      process.env.NODE_ENV === "production" &&
      !betaUsers.some((betaUserEmail) => betaUserEmail === user.email)
    ) {
      return c.json({
        error: "not authenticated",
        type: "invalid",
      } as const);
    }

    return c.json({ type: "valid", user } as const);
  });
