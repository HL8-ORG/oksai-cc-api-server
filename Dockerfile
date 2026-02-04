FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/base-api/package.json apps/base-api/pnpm-lock.yaml ./apps/base-api/

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10

RUN pnpm install --frozen-lockfile

COPY . .

RUN cd apps/base-api && pnpm build

FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/base-api/package.json apps/base-api/pnpm-lock.yaml ./apps/base-api/
COPY apps/base-api/dist ./apps/base-api/dist
COPY apps/base-api/node_modules ./apps/base-api/node_modules
COPY libs ./libs

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "apps/base-api/dist/main.js"]
