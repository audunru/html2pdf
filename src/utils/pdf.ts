import * as playwright from "playwright-aws-lambda";
import { ChromiumBrowser } from "playwright-core";

import { PdfOptions } from "./config";

export const getPdf = async (
  html: string,
  options: {
    javaScriptEnabled: boolean;
    waitUntil: "domcontentloaded" | "load" | "networkidle" | "commit";
    pdfOptions: PdfOptions;
  },
): Promise<string> => {
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

    return pdfBase64Encoded;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
