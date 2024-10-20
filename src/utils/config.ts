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
  WAIT_UNTIL: z
    .union([
      z.literal("domcontentloaded"),
      z.literal("load"),
      z.literal("networkidle"),
      z.literal("commit"),
    ])
    .default("domcontentloaded"),
  PDF_OPTIONS: z
    .string()
    .default("{}")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .transform((x) => JSON.parse(x))
    .pipe(z.object({})),
});

const config = configSchema.safeParse(env);

if (!config.success) {
  console.error("❌ Invalid environment variables:", config.error.format());
  process.exit(1);
}

export default config.data;
