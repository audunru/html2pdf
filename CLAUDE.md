# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A containerized web service that converts HTML to PDF. It exposes a REST API via Express.js and drives a headless Chromium browser through Playwright to render and return PDFs. The Docker image is published to Docker Hub as `audunru/html2pdf`.

- `POST /pdf` — accepts HTML as multipart form data, returns a PDF
- `GET /healthz` — health check endpoint

## Commands

```bash
npm run dev          # Start dev server with live reload (tsx watch)
npm run build        # Compile TypeScript to dist/ via esbuild
npm run start        # Run compiled app (node dist/index.js)
npm run test         # Run tests with Vitest
npm run typecheck    # TypeScript type checking (no emit)
npm run biome:check  # biome (check for issues)
npm run biome:write  # biome (fix all autofixable issues)

```

To run a single test file:
```bash
npx vitest run src/__tests__/index.test.ts
```

## Architecture

### Request flow

1. Multer parses the multipart upload and provides the HTML buffer
2. `src/utils/pdf.ts` launches headless Chromium, loads the HTML via `page.setContent()`, calls `page.pdf()`, then closes the browser
3. The PDF buffer is streamed back to the caller

### Key files

| File | Purpose |
|------|---------|
| `src/index.ts` | Express app, route definitions, request/response wiring |
| `src/utils/pdf.ts` | All Playwright logic — browser launch, HTML loading, PDF generation |
| `src/utils/config.ts` | Zod-validated environment variable schema |
| `src/utils/response.ts` | HTTP status codes and MIME type constants |
| `src/healthcheck.ts` | Node script used by Docker `HEALTHCHECK` |

### Configuration (environment variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `ALLOW_ORIGIN` | — | CORS origin |
| `HEADERS` | — | Extra response headers as JSON |
| `JAVASCRIPT_ENABLED` | `false` | Enable JS in Playwright page context |
| `WAIT_UNTIL` | — | Playwright `waitUntil` strategy |
| `PDF_OPTIONS` | — | Playwright `page.pdf()` options as JSON |
| `PAYLOAD_LIMIT` | `100000` | Max upload size in bytes |

### Docker

Multi-stage Dockerfile (6 stages): `base → deps → builder → prod-deps → playwright-base → runner`. The final image runs as non-root user `express:1001`. The `seccomp_profile.json` at the repo root is a restrictive allowlist profile intended for production use:

```bash
docker run --security-opt seccomp=seccomp_profile.json audunru/html2pdf
```

### CI/CD

- **validate.yml** — runs on PRs: builds Docker image, starts container, runs `npm test`
- **docker-publish.yml** — pushes to Docker Hub on merge to `main` or version tags (`v*`)
- **release.yml** — semantic-release on `main`: bumps version, generates CHANGELOG.md, creates GitHub release (uses conventional commits)

Tests require a running container on `localhost:3000` (see `validate.yml` for the setup pattern). The test helper `src/__tests__/pdf.ts` extracts text from PDFs for assertion.
