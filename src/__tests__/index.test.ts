import { describe, expect, it } from "vitest";

import { getPdfText } from "./pdf";

describe("when printing a pdf", () => {
  describe("if request body is missing", () => {
    it("returns a 400 error", async () => {
      const response = await fetch("http://localhost:3000/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toEqual(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Bad Request" });
    });
  });
  describe("if request body is an empty object", () => {
    it("returns a 400 error", async () => {
      const data = {};
      const response = await fetch("http://localhost:3000/pdf", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toEqual(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Bad Request" });
    });
  });
  describe("if request body html is undefined", () => {
    it("returns a 400 error", async () => {
      const data = { html: undefined };
      const response = await fetch("http://localhost:3000/pdf", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toEqual(400);
      const body = await response.json();
      expect(body).toEqual({ error: "Bad Request" });
    });
  });
  describe("if request body html contains valid HTML", () => {
    it("returns a PDF", async () => {
      const data = {
        html: "<html><body><p>Hello world</p></body></html>",
      };
      const response = await fetch("http://localhost:3000/pdf", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toEqual(200);
      expect(response.headers.get("Content-type")).toEqual("application/pdf");

      const body = await response.arrayBuffer();
      const text = await getPdfText(body);
      expect(text).toEqual("Hello world");
    });
  });
});
