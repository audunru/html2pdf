import { z } from "zod";

export const downloadRequestSchema = z.object({
  html: z.string(),
});
