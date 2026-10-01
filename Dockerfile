# syntax=docker/dockerfile:1

# Decision Model Playground
#
#   docker build -t decision-model-playground .
#   docker run --rm -p 4173:4173 -e TYPESAFE_API_KEY=... decision-model-playground
#
# The app is served by `vite preview`, whose /api proxy adds the API key server-side.
# Pass the key at run time. Never bake it into the image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    TYPESAFE_BASE_URL=https://api.typesafe.ai \
    DEFAULT_MODEL=jev-latest
# vite.config.ts (and the Vite plugins it imports) is needed at run time for the proxy.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json vite.config.ts ./
# Vite writes a temporary bundled copy of its config next to it, so the app dir must be writable.
RUN chown node:node /app
USER node
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173", "--strictPort"]
