import cors from "cors";
import express from "express";
import multer from "multer";
import logger from "pino-http";

import config from "./utils/config";
import { getPdf } from "./utils/pdf";
import { MimeType, ReasonPhrases, StatusCodes } from "./utils/response";

const app = express();
const upload = multer({ limits: { fileSize: config.PAYLOAD_LIMIT } });
app.use(logger());

if (config.ALLOW_ORIGIN) {
  app.use(cors({ origin: config.ALLOW_ORIGIN }));
}

app.post("/pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: ReasonPhrases.BAD_REQUEST });

    return;
  }

  if (config.HSTS_HEADER) {
    res.setHeader("Strict-Transport-Security", config.HSTS_HEADER);
  }

  try {
    const pdf = await getPdf(req.file.buffer, {
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
