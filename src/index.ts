import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin, OpenAPI } from "./plugins/better-auth";
import { user } from "./routes/user";

const app = new Elysia()
	.use(
		cors({
			origin: ["http://localhost:3000", Bun.env.FRONTEND_URL!],
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(
		openapi({
			documentation: {
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
			mapJsonSchema: {
				zod: z.toJSONSchema,
			},
		}),
	)
	.use(betterAuthPlugin)
	.use(user)
	.get("/", () => "Hello Elysia")
	.get("/health", () => ({
		status: "ok",
		environment: Bun.env.NODE_ENV,
		timestamp: new Date().toISOString(),
	}))

	.listen({
		port: Bun.env.PORT,
	});

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${Bun.env.PORT}`);
console.log(`📦 Environment: ${Bun.env.NODE_ENV}`);
