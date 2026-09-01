FROM node:26.8.1-alpine AS base

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

# Extract just the resolved playwright-core version so the expensive browser
# install layer below is only invalidated when Playwright itself changes.
FROM base AS pw-version
  WORKDIR /app
  COPY package-lock.json ./
  RUN node -p "require('./package-lock.json').packages['node_modules/playwright-core'].version" > /pw-version

FROM node:26.8.1-trixie-slim AS playwright-base
  ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
  RUN apt-get update && \
      apt-get -y -t trixie-security upgrade && \
      rm -rf /var/lib/apt/lists/*
  RUN printf 'min-release-age=7\n' > /root/.npmrc && \
      npm i -g npm
  COPY --from=pw-version /pw-version /pw-version
  RUN npx -y playwright@"$(cat /pw-version)" install --with-deps --only-shell chromium

FROM playwright-base AS runner
  WORKDIR /app
  RUN addgroup --system --gid 1001 express
  RUN adduser --system --uid 1001 express
  USER express
  COPY --from=prod-deps --chown=express:express /app/package*.json ./
  COPY --from=prod-deps --chown=express:express /app/node_modules ./node_modules
  COPY --from=builder --chown=express:express /app/dist ./dist
  HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD node dist/healthcheck.js
  ENTRYPOINT ["npm", "run", "start"]