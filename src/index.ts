import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import * as playwright from "playwright-aws-lambda";
import { ChromiumBrowser } from "playwright-core";

import config, { PdfOptions } from "./utils/config";
import { downloadRequestSchema } from "./utils/request";
import {
  ReasonPhrases,
  respondError,
  respondSuccess,
  StatusCodes,
} from "./utils/response";

type PdfEvent = Pick<APIGatewayProxyEventV2, "body">;

export const getPdf = async (
  html: string,
  options: {
    javaScriptEnabled: boolean;
    waitUntil: "domcontentloaded" | "load" | "networkidle" | "commit";
    pdfOptions: PdfOptions;
  },
): Promise<APIGatewayProxyStructuredResultV2> => {
  let browser: ChromiumBrowser | null = null;

  try {
    browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({
      javaScriptEnabled: options.javaScriptEnabled,
    });
    const page = await context.newPage();
    await page.setContent(html, {
      waitUntil: options.waitUntil,
    });
    const pdf = await page.pdf(options.pdfOptions);
    await context.close();
    const pdfBase64Encoded = pdf.toString("base64");

    return respondSuccess(pdfBase64Encoded);
  } catch (error) {
    console.error(error);

    return respondError(
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const handler = async (
  event: PdfEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { body = "" } = event;

  const request = downloadRequestSchema.safeParse(body);

  if (!request.success) {
    return respondError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

  return getPdf(request.data.html, {
    javaScriptEnabled: config.JAVASCRIPT_ENABLED,
    waitUntil: config.WAIT_UNTIL,
    pdfOptions: config.PDF_OPTIONS,
  });
};
