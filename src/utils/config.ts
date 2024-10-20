import { env } from "node:process";

import { z } from "zod";

const configSchema = z.object({
  ALLOW_ORIGIN: z.string().optional(),
  HSTS_HEADER: z.string().optional(),
  JAVASCRIPT_ENABLED: z
    .string()
    .toLowerCase()
    .optional()
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  WAIT_UNTIL: z.string().default("domcontentloaded"),
});

const config = configSchema.safeParse(env);

if (!config.success) {
  console.error("❌ Invalid environment variables:", config.error.format());
  process.exit(1);
}

export default config.data;
