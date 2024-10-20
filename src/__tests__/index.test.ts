import { beforeEach, describe, expect, it } from "vitest";

import { handler } from "..";
import config from "../utils/config";
import { getPdfText } from "./pdf";

const originalConfig = { ...config };

describe("when printing a pdf", () => {
  beforeEach(() => {
    config.ALLOW_ORIGIN = originalConfig.ALLOW_ORIGIN;
    config.HSTS_HEADER = originalConfig.HSTS_HEADER;
  });
  describe("if request body is missing", () => {
    it("returns a 400 error", async () => {
      const event = {};
      const response = await handler(event);

      expect(response.statusCode).toEqual(400);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual("Bad Request");
    });
  });
  describe("if request body is an empty object", () => {
    it("returns a 400 error", async () => {
      const event = {
        body: JSON.stringify({}),
      };
      const response = await handler(event);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual("Bad Request");
    });
  });
  describe("if request body html is undefined", () => {
    it("returns a 400 error", async () => {
      const event = {
        body: JSON.stringify({
          html: undefined,
        }),
      };
      const response = await handler(event);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual("Bad Request");
    });
  });
  describe("if request body html contains valid HTML", () => {
    it("returns a PDF", async () => {
      config.ALLOW_ORIGIN = "https://domain.com";
      config.HSTS_HEADER = "max-age=63072000; includeSubDomains; preload";

      const event = {
        body: JSON.stringify({
          html: "<html><body><p>Hello world</p></body></html>",
        }),
      };
      const response = await handler(event);

      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(true);
      expect(response.headers).toEqual({
        "Content-type": "application/pdf",
        "Access-Control-Allow-Origin": "https://domain.com",
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      });

      const text = await getPdfText(
        Uint8Array.from(atob(response.body as string), (c) => c.charCodeAt(0)),
      );

      expect(text).toEqual("Hello world");
    });
  });
  describe("if environment variable ALLOW_ORIGIN is undefined", () => {
    it("returns headers without Access-Control-Allow-Origin", async () => {
      config.HSTS_HEADER = "max-age=63072000; includeSubDomains; preload";

      const event = {
        body: JSON.stringify({
          html: "<html><body><p>Hello world</p></body></html>",
        }),
      };
      const response = await handler(event);

      expect(response.headers).toEqual({
        "Content-type": "application/pdf",
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      });
    });
  });
});
