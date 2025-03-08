FROM mcr.microsoft.com/playwright:v1.50.1-jammy AS base

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

FROM base AS runner
  WORKDIR /app
  RUN addgroup --system --gid 1001 express
  RUN adduser --system --uid 1001 express
  USER express
  COPY --from=prod-deps --chown=express:express /app/package*.json ./
  COPY --from=prod-deps --chown=express:express /app/node_modules ./node_modules
  COPY --from=builder --chown=express:express /app/dist ./dist
  ENTRYPOINT ["npm", "run", "start"]