import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import * as playwright from "playwright-aws-lambda";
import { ChromiumBrowser } from "playwright-core";

import config from "./utils/config";
import { downloadRequestSchema } from "./utils/request";
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
  let browser: ChromiumBrowser | null = null;

  const request = downloadRequestSchema.safeParse(body);

  if (!request.success) {
    return respondError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

  try {
    browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({
      javaScriptEnabled: config.JAVASCRIPT_ENABLED,
    });
    const page = await context.newPage();
    await page.setContent(request.data.html, {
      waitUntil: config.WAIT_UNTIL,
    });
    const pdf = await page.pdf(config.PDF_OPTIONS);
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
