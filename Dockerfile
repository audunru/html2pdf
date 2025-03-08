FROM node:22-alpine AS base

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

FROM mcr.microsoft.com/playwright:v1.51.0-jammy AS playwright-base
  RUN npx playwright uninstall --all
  RUN npx playwright install --only-shell chromium

FROM playwright-base AS runner
  WORKDIR /app
  RUN addgroup --system --gid 1001 express
  RUN adduser --system --uid 1001 express
  USER express
  COPY --from=prod-deps --chown=express:express /app/package*.json ./
  COPY --from=prod-deps --chown=express:express /app/node_modules ./node_modules
  COPY --from=builder --chown=express:express /app/dist ./dist
  ENTRYPOINT ["npm", "run", "start"]