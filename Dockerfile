FROM node:24.14.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24.14.0-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app/node-server.mjs ./
COPY --from=build /app/dist ./dist
# The wildcard keeps runtime.env optional: deploys bake it in, local runs pass env with `docker run --env-file`.
COPY --chown=node:node runtime.env* ./
USER node
EXPOSE 8080
CMD ["node", "--enable-source-maps", "--env-file-if-exists=runtime.env", "node-server.mjs"]
