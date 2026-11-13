FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter @workspace/web... --frozen-lockfile || pnpm install --filter @workspace/web...

COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
