# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.18.2
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.10.2
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules
COPY --link .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Mount secrets and build application
RUN --mount=type=secret,id=BUTTONDOWN_API_KEY \
    --mount=type=secret,id=EMAIL_APP_PASSWORD \
    --mount=type=secret,id=EMAIL_APP_TO_ADDRESS \
    --mount=type=secret,id=EMAIL_APP_USER \
    --mount=type=secret,id=EXCHANGE_RATE_API_KEY \
    --mount=type=secret,id=FATHOM_API_KEY \
    --mount=type=secret,id=GITHUB_TOKEN \
    --mount=type=secret,id=PUBLIC_FATHOM_ID \
    --mount=type=secret,id=PUBLIC_FATHOM_URL \
    --mount=type=secret,id=UPSTASH_REDIS_REST_TOKEN \
    --mount=type=secret,id=UPSTASH_REDIS_REST_URL \
    --mount=type=secret,id=TURSO_DB_URL \
    --mount=type=secret,id=TURSO_DB_AUTH_TOKEN \
    BUTTONDOWN_API_KEY="$(cat /run/secrets/BUTTONDOWN_API_KEY)" \
    EMAIL_APP_PASSWORD="$(cat /run/secrets/EMAIL_APP_PASSWORD)" \
    EMAIL_APP_TO_ADDRESS="$(cat /run/secrets/EMAIL_APP_TO_ADDRESS)" \
    EMAIL_APP_USER="$(cat /run/secrets/EMAIL_APP_USER)" \
    EXCHANGE_RATE_API_KEY="$(cat /run/secrets/EXCHANGE_RATE_API_KEY)" \
    FATHOM_API_KEY="$(cat /run/secrets/FATHOM_API_KEY)" \
    GITHUB_TOKEN="$(cat /run/secrets/GITHUB_TOKEN)" \
    PUBLIC_FATHOM_ID="$(cat /run/secrets/PUBLIC_FATHOM_ID)" \
    PUBLIC_FATHOM_URL="$(cat /run/secrets/PUBLIC_FATHOM_URL)" \
    UPSTASH_REDIS_REST_TOKEN="$(cat /run/secrets/UPSTASH_REDIS_REST_TOKEN)" \
    UPSTASH_REDIS_REST_URL="$(cat /run/secrets/UPSTASH_REDIS_REST_URL)" \
    TURSO_DB_URL="$(cat /run/secrets/TURSO_DB_URL)" \
    TURSO_DB_AUTH_TOKEN="$(cat /run/secrets/TURSO_DB_AUTH_TOKEN)" \
    && pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
