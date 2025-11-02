/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import { getUserFirstStepStatus } from "@/helpers/get-first-step";
import { RESERVED_USERNAMES } from "@/helpers/invalid-usernames";
import { db } from "@/drizzle/client";
import { schema } from "@/drizzle/schemas/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin as adminPlugin,
  customSession,
  magicLink,
  openAPI,
  organization,
  username,
} from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(Bun.env.RESEND_API_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
    usePlural: true,
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    openAPI(),
    adminPlugin(),
    username({
      usernameValidator: (username) => {
        return !RESERVED_USERNAMES.includes(username.toLocaleLowerCase());
      },
      minUsernameLength: 2,
      maxUsernameLength: 25,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "Nimbo <noreplay@skelware.com>",
          to: email,
          subject: "Seu link mágico do Nimbo ✨",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Entre no Nimbo</h2>
              <p>Clique no botão abaixo para fazer login:</p>
              <a
                href="${url}"
                style="display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;"
              >
                Entrar agora
              </a>
              <p style="color: #666; font-size: 14px;">
                Este link expira em 15 minutos e só pode ser usado uma vez.
              </p>
              <p style="color: #666; font-size: 14px;">
                Se você não solicitou este email, pode ignorá-lo.
              </p>
            </div>
          `,
        });
      },
      disableSignUp: false,
    }),
    organization({
      teams: {
        enabled: true,
      },
    }),
    customSession(async ({ user, session }) => {
      const firstStepCompleted = await getUserFirstStepStatus(session.userId);
      return {
        user: {
          ...user,
          firstStepCompleted,
        },
        session,
      };
    }),
  ],

  // hooks: {
  //   after: createAuthMiddleware(async (ctx) => {
  //     if (ctx.path.startsWith("/sign-in/magic-link/verify")) {
  //       if (ctx.context.session) {
  //         const firstStepCompleted = await getUserFirstStepStatus(
  //           ctx.context.session?.user.id,
  //         );

  //         ctx.context.session.user.firstStepCompleted = firstStepCompleted;

  //         return ctx;
  //       }
  //     }
  //   }),
  // },
  trustedOrigins: [Bun.env.BETTER_AUTH_URL!, Bun.env.FRONTEND_URL!],
});
