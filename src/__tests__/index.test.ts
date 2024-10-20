import { describe, expect, it } from "vitest";

import { handler } from "../";
import { getPdfText } from "../utils/pdf";

describe("when printing a pdf", () => {
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
      const originalOrigin = process.env.ALLOW_ORIGIN;
      process.env.ALLOW_ORIGIN = "https://domain.com";

      const event = {
        body: JSON.stringify({
          html: "<html><body><p>Hello world</p></body></html>",
        }),
      };
      const response = await handler(event);

      expect(response.statusCode).toEqual(200);
      expect(response.isBase64Encoded).toEqual(true);
      expect(response.headers).toEqual({
        "Access-Control-Allow-Origin": "https://domain.com",
        "Content-type": "application/pdf",
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      });

      const text = await getPdfText(
        Uint8Array.from(atob(response.body as string), (c) => c.charCodeAt(0)),
      );

      expect(text).toEqual("Hello world");

      process.env.ALLOW_ORIGIN = originalOrigin;
    });
  });
  describe("if environment variable ALLOW_ORIGIN is undefined", () => {
    it("returns headers without Access-Control-Allow-Origin", async () => {
      const originalOrigin = process.env.ALLOW_ORIGIN;
      delete process.env.ALLOW_ORIGIN;

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

      process.env.ALLOW_ORIGIN = originalOrigin;
    });
  });
});
