import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@/drizzle/client";
import { users } from "@/drizzle/schemas/better-auth/users";
import { auth } from "@/lib/auth";

export const user = new Elysia({ name: "User" }).post(
	"/user/update",
	async ({ body }) => {
		const userId = body.id;

		const [updatedUser] = await db
			.update(users)
			.set({
				name: body.name,
				surename: body.surname,
				birthday: body.date_of_birth ? new Date(body.date_of_birth) : undefined,
				username: body.username,
				displayUsername: body.display_name,
				first_step_completed: true,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId))
			.returning();

		return {
			success: true,
			message: "User updated successfully",
		};
	},
	{
		auth: true,
		body: z.object({
			name: z.string().min(1).max(100),
			surname: z.string().min(1).max(100),
			date_of_birth: z.iso.date().optional(),
			username: z.string().min(2).max(25),
			display_name: z.string().min(1).max(50),
			id: z.uuid(),
		}),
		detail: {
			tags: ["User"],
			summary: "Update user profile",
			description: "Update user profile information and complete first step",
		},
	},
);
