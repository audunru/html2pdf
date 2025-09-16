ARG PLAYWRIGHT_VERSION="1.51.0"

FROM node:24-alpine AS base

FROM base AS deps
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci

FROM deps AS builder
  WORKDIR /app
  COPY . .
  RUN npm run build

FROM deps AS prod-deps
  WORKDIR /app
  RUN npm ci --omit=dev

FROM node:24-bookworm AS playwright-base
  ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
  RUN npx -y playwright@${PLAYWRIGHT_VERSION} install --with-deps --only-shell chromium

FROM playwright-base AS runner
  WORKDIR /app
  RUN addgroup --system --gid 1001 express
  RUN adduser --system --uid 1001 express
  USER express
  COPY --from=prod-deps --chown=express:express /app/package*.json ./
  COPY --from=prod-deps --chown=express:express /app/node_modules ./node_modules
  COPY --from=builder --chown=express:express /app/dist ./dist
  ENTRYPOINT ["npm", "run", "start"]