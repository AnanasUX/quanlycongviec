FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --filter @workspace/api... --frozen-lockfile || pnpm install --filter @workspace/api...

COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "dev"]
