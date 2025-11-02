import { db } from "@/drizzle/client";
import { users } from "@/drizzle/schemas/better-auth/users";
import { eq } from "drizzle-orm";

export async function getUserFirstStepStatus(userId: string): Promise<boolean> {
  const result = await db
    .select({
      first_step_completed: users.first_step_completed,
    })
    .from(users)
    .where(eq(users.id, userId));

  return result[0]?.first_step_completed ?? false;
}
