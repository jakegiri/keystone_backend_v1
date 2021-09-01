import { config } from "@keystone-next/keystone/schema";
import {
  statelessSessions,
  withItemData,
} from "@keystone-next/keystone/session";
import { createAuth } from "@keystone-next/auth";

import { lists } from "./schema";
import { extendGraphqlSchema } from "./mutations/index";
import "dotenv/config";
import { sendPasswordResetEmail } from "./lib/mail";
import { permissionsList } from "./schema/fields";

//###################################################################
//###################################################################
//###################################################################

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === "production") {
    // throw new Error(
    //   "The SESSION_SECRET environment variable must be set in production"
    // );
    sessionSecret = "fdhkfhkdlhfajkdhfkjhdkjfhdkjhfdf";
  } else {
    sessionSecret = "-- DEV COOKIE SECRET; CHANGE ME --";
  }
}

let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const auth = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token }) => {
      console.log({ itemId, identity, token });
      await sendPasswordResetEmail(token, identity);
    },
  },
});

export default auth.withAuth(
  config({
    db: {
      adapter: "prisma_postgresql",
      url:
        process.env.DATABASE_URL ||
        "postgres://postgres:007700@localhost/sickfits",
      async onConnect(context) {
        console.log("Hahahahahhha I'm connected");
      },
    },
    ui: {
      isAccessAllowed: (context) => {
        return !!context.session?.data;
      },
    },
    lists,
    extendGraphqlSchema,
    session: withItemData(
      statelessSessions({
        maxAge: sessionMaxAge,
        secret: sessionSecret,
      }),
      { User: `id name email role { ${permissionsList.join(" ")} }` }
    ),
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL!],
        credentials: true,
      },
    },
  })
);
