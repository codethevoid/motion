FROM node:22.12.0-slim as base
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
RUN npm install -g pnpm@9.15.1

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM base as production
ENV NODE_ENV=production
CMD [ "pnpm", "start" ]