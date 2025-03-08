import express from "express";
import logger from "pino-http";

import config from "./utils/config";
import { getPdf } from "./utils/pdf";
import { downloadRequestSchema } from "./utils/request";
import { MimeType, ReasonPhrases, StatusCodes } from "./utils/response";

const app = express();

app.use(express.json());
app.use(logger());

app.post("/pdf", async (req, res) => {
  const request = downloadRequestSchema.safeParse(req.body);

  if (config.ALLOW_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", config.ALLOW_ORIGIN);
  }

  if (config.HSTS_HEADER) {
    res.setHeader("Strict-Transport-Security", config.HSTS_HEADER);
  }

  if (!request.success) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: ReasonPhrases.BAD_REQUEST });

    return;
  }

  try {
    const pdf = await getPdf(request.data.html, {
      javaScriptEnabled: config.JAVASCRIPT_ENABLED,
      waitUntil: config.WAIT_UNTIL,
      pdfOptions: config.PDF_OPTIONS,
    });

    res.setHeader("Content-Type", MimeType.PDF);
    res.status(StatusCodes.OK).send(pdf);
  } catch {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
});

app.listen(config.PORT, () => {
  console.log(`🚀 PDF server listening on port ${config.PORT}`);
});
