import { env } from "node:process";

import { Page } from "playwright-core";
import { z } from "zod";

import { parseJson } from "./json";

export type PdfOptions = Parameters<Page["pdf"]>[0];

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
    .transform(parseJson<PdfOptions>)
    .pipe(z.object({}).passthrough()),
  PORT: z.string().default("3000"),
  PAYLOAD_LIMIT: z.coerce.number().default(100 * 1024),
});

const config = configSchema.safeParse(env);

if (!config.success) {
  console.error("❌ Invalid environment variables:", config.error.format());
  process.exit(1);
}

export default config.data;
