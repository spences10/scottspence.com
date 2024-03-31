# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.36
FROM oven/bun:${BUN_VERSION}-slim as base

# Declare build arguments for secrets
ARG BUTTONDOWN_API_KEY
ARG EMAIL_APP_PASSWORD
ARG EMAIL_APP_TO_ADDRESS
ARG EMAIL_APP_USER
ARG EXCHANGE_RATE_API_KEY
ARG FATHOM_API_KEY
ARG GITHUB_TOKEN
ARG PUBLIC_FATHOM_ID
ARG PUBLIC_FATHOM_URL
ARG UPSTASH_REDIS_REST_TOKEN
ARG UPSTASH_REDIS_REST_URL
ARG TURSO_DB_URL
ARG TURSO_DB_AUTH_TOKEN
ARG INGEST_TOKEN

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules
COPY --link .npmrc bun.lockb package.json ./
RUN bun install

# Copy application code
COPY --link . .

# Build application using build arguments
RUN TURSO_DB_URL=$TURSO_DB_URL TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN \
    BUTTONDOWN_API_KEY=$BUTTONDOWN_API_KEY EMAIL_APP_PASSWORD=$EMAIL_APP_PASSWORD \
    EMAIL_APP_TO_ADDRESS=$EMAIL_APP_TO_ADDRESS EMAIL_APP_USER=$EMAIL_APP_USER \
    EXCHANGE_RATE_API_KEY=$EXCHANGE_RATE_API_KEY FATHOM_API_KEY=$FATHOM_API_KEY \
    GITHUB_TOKEN=$GITHUB_TOKEN PUBLIC_FATHOM_ID=$PUBLIC_FATHOM_ID \
    PUBLIC_FATHOM_URL=$PUBLIC_FATHOM_URL UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN \
    UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL INGEST_TOKEN=$INGEST_TOKEN \
    bun run build

# Remove development dependencies
RUN rm -rf node_modules && \
    bun install --ci


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "start" ]
