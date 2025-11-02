/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schemas/better-auth";

export const db = drizzle(Bun.env.DATABASE_URL!, { schema });
