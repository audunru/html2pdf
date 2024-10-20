/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
const playwright = require("playwright-aws-lambda");

import { isDownloadRequest, safeJsonParse } from "./utils/request";
import {
  ReasonPhrases,
  respondError,
  respondSuccess,
  StatusCodes,
} from "./utils/response";

export const handler = async (
  event: Pick<APIGatewayProxyEventV2, "body">,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { body = "" } = event;
  let browser = null;

  const request = safeJsonParse(isDownloadRequest)(body);
  if (request.hasError) {
    return respondError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

  try {
    browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.setContent(request.parsed.html, {
      waitUntil: "domcontentloaded",
    });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: {
        top: "1cm",
        bottom: "1cm",
        left: "1cm",
        right: "1cm",
      },
    });
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
