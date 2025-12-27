---
date: 2023-12-11
updated: 2024-03-22
title: 'SvelteKit Environment Variables with Fly.io Deployment'
tags: ['sveltekit', 'notes', 'flyio', 'docker']
is_private: false
---

Real quick! I'm going to go through what I did to get a SvelteKit
project deployed to Fly.io and how to set up environment variables.
The back story is that I wasn't getting the best response times from
the project I deployed to Vercel for [Building Session Analytics with
SvelteKit and Turso DB]. It was an experiment but still, waiting 6
seconds for a response from the server is not good.

I decide to try out Fly.io and see if I could get better result.
There's a speed run over on the Fly.io docs that get's you started:
https://fly.io/docs/js/frameworks/svelte

This doesn't cover what you need to do to get environment variables
working though.

I followed the steps in the speed run and kept getting errors like
this:

```text
#0 5.057 "TURSO_DB_URL" is not exported by "virtual:$env/static/private", imported by "src/lib/turso/client.ts".
#0 5.057 file: /app/src/lib/turso/client.ts:3:1
#0 5.057 1: import {
#0 5.057 2:   TURSO_DB_AUTH_TOKEN,
#0 5.057 3:   TURSO_DB_URL,
#0 5.057      ^
#0 5.057 4: } from '$env/static/private';
```

I couldn't get the static private environment variables to work so I
decided to try out the dynamic private environment variables.

So, anywhere I was importing the static private environment variables
I changed to dynamic private:

```git
-import {
-  TURSO_DB_AUTH_TOKEN,
-  TURSO_DB_URL,
-} from '$env/static/private';
+import { env } from '$env/dynamic/private';
+const { TURSO_DB_AUTH_TOKEN, TURSO_DB_URL } = env;
```

Then made sure my secrets were available to the fly CLI:

```bash
fly secrets set TURSO_DB_URL=secret_token
fly secrets set TURSO_DB_AUTH_TOKEN=secret_token
fly secrets set IPINFO_TOKEN=secret_token
```

Then I needed to add the secrets to the Docker file created by
`fly launch`:

```dockerfile
# ...

# Copy application code
COPY --link . .

# Mount secrets and build application
RUN --mount=type=secret,id=TURSO_DB_AUTH_TOKEN \
    --mount=type=secret,id=TURSO_DB_URL \
    --mount=type=secret,id=IPINFO_TOKEN \
    TURSO_DB_AUTH_TOKEN="$(cat /run/secrets/TURSO_DB_AUTH_TOKEN)" \
    TURSO_DB_URL="$(cat /run/secrets/TURSO_DB_URL)" \
    IPINFO_TOKEN="$(cat /run/secrets/IPINFO_TOKEN)" \
    && pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# ...
```

Then deploying again (with `fly deploy`) worked!

One other thing to note is that the Fly CLI doesn't seem to pick up
the environment variables so I had to add them manually to the
`fly deploy` command each time I want to deploy:

```bash
fly deploy --build-secret TURSO_DB_URL="secret_token" --build-secret TURSO_DB_URL="secret_token" --build-secret IPINFO_TOKEN="secret_token"
```

## Update

Another update to this, it seems that the Fly CLI changes a fair bit!

I was getting countless issues with building and not having the
secrets available to the Docker build. I found something that worked
for me.

So, I had to add the secrets to the Dockerfile `ARG TURSO_DB_URL` and
`ARG TURSO_DB_AUTH_TOKEN`, then build the app with the tokens
`RUN TURSO_DB_URL=$TURSO_DB_URL TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN pnpm run build`:

```dockerfile
# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.19.0
FROM node:${NODE_VERSION}-slim as base

# Declare build arguments for secrets
ARG TURSO_DB_URL
ARG TURSO_DB_AUTH_TOKEN

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.15.4
RUN npm install -g pnpm@$PNPM_VERSION

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Build application using build arguments
RUN TURSO_DB_URL=$TURSO_DB_URL TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
```

Then also had to pass them into the `fly deploy` command:

```bash
fly deploy --build-arg TURSO_DB_URL=$TURSO_DB_URL --build-arg TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN
```

😅

<!-- Links -->

[Building Session Analytics with SvelteKit and Turso DB]:
  https://scottspence.com/posts/building-session-analytics-sveltekit-turso-db
