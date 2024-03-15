import "dotenv/config";
import type { Config } from "drizzle-kit";
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg",
} satisfies Config;
