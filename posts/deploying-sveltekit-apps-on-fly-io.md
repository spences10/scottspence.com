---
date: 2024-03-23
title: Deploying SvelteKit Apps on Fly.io
tags: ['sveltekit', 'flyio', 'docker', 'notes', 'turso']
isPrivate: false
---

Ok, so I went over this in this in a
[post](https://scottspence.com/posts/sveltekit-environment-variables-flyio-deployment)
a while back. I was having issues deploying a SvelteKit app to Fly.io.
The reasoning behind me wanting to use Fly is so that I can put the
projects near where the users are, reducing latency and giving an all
round better experience. In this case it's for a proof of concept more
than anything else before I start using Fly for other projects. My
ideal is so that I can use Turso (which can also be used on serverless
platforms like Vercel) then use an
[embedded replica](https://docs.turso.tech/features/embedded-replicas)
for zero latency reads and writes (which you can't do on a serveless
platform like Vercel).

Once the app is built and deployed on Fly I then want to assign a
domain to it.

Two relatively simple steps when you think about it, right? Well, the
most frustrating part was actually getting the Docker project to build
for Fly.

## The setup

What I wanted to do is have a SvelteKit app that uses Lucia auth and
Turso. So, go through the Lucia auth tutorial to set it up using Turso
for the database.

Additional dependencies on top of the SvelteKit skeleton:

```json
"@libsql/client": "^0.5.6",
"@lucia-auth/adapter-sqlite": "^3.0.1",
"@sveltejs/adapter-node": "^5.0.1",
"lucia": "^3.1.1",
"oslo": "^1.1.3"
```

There's also Tailwind CSS and daisyUI (standard for me), but
irrelevant for this post.

Check the links for specifics for how I've implemented it for my app
(Rinku Cloud) and the Lucia docs and example code.

- [Rinku Cloud repo](https://github.com/spences10/rinku-cloud/tree/feat/we-go-again-fly)
- [Lucia docs guide](https://lucia-auth.com/tutorials/username-and-password/sveltekit)
- [Lucia GitHub example repo](https://github.com/lucia-auth/examples/tree/main/sveltekit/username-and-password)

It's essentially the SvelteKit skeleton with Lucia auth and Turso
added, so this should be a piece of piss to do, right?

Well...

## Fly Config

So, to get the project on Fly there's a couple of steps, two, yes.
Anyway, install the Fly CLI and login, then `fly launch` to have the
project configured. Then `fly deploy` to deploy the project.

First up, `fly launch` does most of the configuration for you, it
installs `@flydotio/dockerfile` and creates the following files:

```text
.dockerignore
Dockerfile
fly.toml
```

If you're in the UK and the CLI configures `lhr` for the
`primary_region` in the `fly.toml` file change it! 😅 I had so many
build issues with the `lhr` region that I now just don't bother with
it and now set it to `primary_region = 'iad'`. I can add another
region later once the project builds.

## Secrets

Ok, so, add in the secrets for the project, I have two secrets for the
project:

```bash
TURSO_DB_AUTH_TOKEN=my-super-secret-auth-token
TURSO_DB_URL=my-turso-db-url
```

From previous experience I now add these as environment variables in
my terminal:

```bash
export TURSO_DB_AUTH_TOKEN=my-super-secret-auth-token
export TURSO_DB_URL=my-turso-db-url
```

This means that I'm not copy pasting secrets to the terminal
repeatedly and just use a variable like `$TURSO_DB_URL`.

I need to set the secrets in the Fly project from the Fly CLI:

```bash
fly secrets set TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN
fly secrets set TURSO_DB_URL=$TURSO_DB_URL
```

Now I can use `fly deploy` to deploy the project, right?

Well, yeah, but, no!

## Building the Docker Project for Fly

This is where the fun started, and when I say fun, what I actually
mean is hours of me banging my head against this (for many, many
hours).

Because SvelteKit is a compiler I always install dependencies as
`devDependencies`, regardless, I learned from the last post I did
about this that the `@libsql/client` should be installed in regular
`dependencies` due to some ESM/CJS shenanigans.

Wouldn't build though, I'd keep getting an error that was something
along the lines of this:

```text
node:internal/event_target:1062
  process.nextTick(() => { throw err; });
                           ^
Error [LibsqlError]: URL_INVALID: The URL is not in a valid format
    at parseUri (file:///app/node_modules/.pnpm/@libsql+core@0.5.6/node_modules/@libsql/core/lib-esm/uri.js:9:15)
```

Ok, Fly still can't read the environment variables, so, try building
locally? Building locally I got an error that was something along the
lines of `RollupError: Unexpected character '\u{7f}'`, so, again not
building for ESM so I have to pick through the packages and find which
one is causing the issue.

Wasn't a massive pain as there was only a couple of additional
packages. `oslo` was the culprit, so I had move that to `dependencies`
along with `@libsql/client`.

Go again!

Still not building, same `URL_INVALID` error...

This is pretty much where I was, for a long, long time. I tried so
many different configurations with the Dockerfile and passing in the
secrets to the terminal.

I had to have the secrets in the Dockerfile and in the `fly deploy`
command. For the Dockerfile I had to have them as build arguments near
the top of the file.

```dockerfile
# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.19.0
FROM node:${NODE_VERSION}-slim as base

# Declare build arguments for secrets
ARG TURSO_DB_URL
ARG TURSO_DB_AUTH_TOKEN

LABEL fly_launch_runtime="Node.js"
```

Then toward the end of the Dockerfile I had to use the build arguments
to build the project using the secrets:

```dockerfile
# Copy application code
COPY --link . .

# Build application using build arguments
RUN TURSO_DB_URL=$TURSO_DB_URL TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod
```

From the terminal I had to pass in the secrets as build arguments as
well:

```bash
fly deploy --build-arg TURSO_DB_URL=$TURSO_DB_URL --build-arg TURSO_DB_AUTH_TOKEN=$TURSO_DB_AUTH_TOKEN
```

Success! 🎉

That did it for me this time around, is it correct? I don't know, but
it worked for me so I'm sticking with it! (for now)

## Getting set up with a domain on Fly

So, as all developers do, I bought the domain before making the
project! 😅

With that out of the way to begin with I could then add that to my Fly
project, even though it's just a login form with a database behind it!

I know up until this point I haven't really mentioned the Fly.io
documentation, this is some of the best documentation out there!

So I follow the documentation here:
https://fly.io/docs/networking/custom-domain

Set up a CNAME and A record in Cloudflare.

| Type  | Name        | Content             | Proxy Status | TTL  |
| ----- | ----------- | ------------------- | ------------ | ---- |
| A     | rinku.cloud | 66.241.125.15       | DNS only     | Auto |
| CNAME | www         | rinku-cloud.fly.dev | DNS only     | Auto |

I need to generate SSL certs for both of the records via the Fly CLI!

```bash
fly certs add rinku.cloud
fly certs add www.rinku.cloud
```

Then wait for the cert to be provisioned, I can check on the status
with `fly certs show rinku.cloud` and `fly certs show www.rinku.cloud`

```bash
fly certs show rinku.cloud
```

I get a helpful prompt to add an AAA record to prove my ownership.

```text
The certificate for rinku.cloud has not been issued yet.

Hostname                  = rinku.cloud
DNS Provider              = cloudflare
Certificate Authority     = Let's Encrypt
Issued                    =
Added to App              = 3 minutes ago
Source                    = fly

You are creating a certificate for rinku.cloud
We are using lets_encrypt for this certificate.

You can validate your ownership of rinku.cloud by:

1: Adding an AAAA record to your DNS service which reads:

    AAAA @ 2a09:8280:1::2e:fa4a:0
```

I'm also advised to turn off the proxy for the domain in Cloudflare.

Eventually I get my certs setup!

```text
The certificate for rinku.cloud has been issued.

Hostname                  = rinku.cloud
DNS Provider              = cloudflare
Certificate Authority     = Let's Encrypt
Issued                    = rsa,ecdsa
Added to App              = 7 minutes ago
Source                    = fly
```

I'm all set!

I can now access the app via the domain I've assigned to it.

## Conclusion

So, that's it, I have a SvelteKit app with Lucia auth and Turso
deployed on Fly.io with a domain assigned to it.

Now I have to build out the app, but that's for another post! 😅
