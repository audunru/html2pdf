import { z } from "zod";

import { parseJson } from "./json";

interface DownloadRequest {
  html: string;
}

export const downloadRequestSchema = z
  .string()
  .transform(parseJson<DownloadRequest>)
  .pipe(
    z.object({
      html: z.string(),
    }),
  );
