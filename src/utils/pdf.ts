import { chromium, ChromiumBrowser } from "playwright-core";

import { PdfOptions } from "./config";

export const getPdf = async (
  html: string,
  options: {
    javaScriptEnabled: boolean;
    waitUntil: "domcontentloaded" | "load" | "networkidle" | "commit";
    pdfOptions: PdfOptions;
  },
): Promise<Buffer> => {
  let browser: ChromiumBrowser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      javaScriptEnabled: options.javaScriptEnabled,
    });
    const page = await context.newPage();
    await page.setContent(html, {
      waitUntil: options.waitUntil,
    });
    const pdf = await page.pdf(options.pdfOptions);
    await context.close();

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
