/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration
 *
 * Usa process.env.DATABASE_URL direto.
 * O script em package.json já carrega o .env com --env-file.
 */
export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./drizzle/schemas/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
