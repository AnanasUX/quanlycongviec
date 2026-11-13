FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/realtime/package.json ./apps/realtime/

RUN pnpm install --filter @workspace/realtime... --frozen-lockfile || pnpm install --filter @workspace/realtime...

COPY apps/realtime ./apps/realtime

WORKDIR /app/apps/realtime
EXPOSE 4001
CMD ["pnpm", "dev"]
