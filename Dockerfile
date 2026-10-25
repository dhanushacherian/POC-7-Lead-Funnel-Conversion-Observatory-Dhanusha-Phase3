FROM node:24-alpine3.23 AS builder

WORKDIR /app

RUN apk add --no-cache python3 libc6-compat && \
    ln -sf /usr/bin/python3 /usr/local/bin/python

COPY package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

RUN npm run build && \
    npm prune --omit=dev && \
    chown -R node:node /app

FROM alpine:3.23 AS runtime

RUN apk add --no-cache nodejs python3 libc6-compat && \
    addgroup -S -g 1000 node && \
    adduser -S -u 1000 -G node node

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/ ./

EXPOSE 3000
USER node

CMD ["node", "node_modules/next/dist/bin/next", "start"]
