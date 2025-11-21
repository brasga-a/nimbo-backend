/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import { db } from "@/drizzle/client";
import { schema } from "@/drizzle/schemas/better-auth";
import { getUserFirstStepStatus } from "@/helpers/get-first-step";
import { RESERVED_USERNAMES } from "@/helpers/invalid-usernames";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import {
	admin as adminPlugin,
	customSession,
	emailOTP,
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
			prompt: "select_account",
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
		emailOTP({
			async sendVerificationOTP({ email, otp, type }){
				if (type === "sign-in"){
					await resend.emails.send({
						from: "Nimbo <noreplay@skelware.com>",
						to: email,
						subject: "Seu código de acesso",
						html: `<p>${otp}</p>`
					})
				} else if (type === "email-verification"){

				}else {

				}
			}
		}),
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				await resend.emails.send({
					from: "Nimbo <noreplay@skelware.com>",
					to: email,
					subject: "Link de acesso ao Nimbo",
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

	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path.startsWith('/callback/')) {
				const error = ctx.query?.error
				
				if (error) {
					return new Response(`
						<script>
							if (window.opener) {
								window.opener.postMessage({type:'oauth_error', error:'${error}'},'*')
								window.close()
							} else {
								window.location.href='/login?error=${error}'
							}
						</script>
					`, { headers: { 'content-type': 'text/html' }})
				}
			}
		}),
  },

	trustedOrigins: [Bun.env.BETTER_AUTH_URL!, Bun.env.FRONTEND_URL!],
});
