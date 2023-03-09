---
date: 2022-10-02
title: Set up a free PocketBase database with Fly.io
tags: ['pocketbase', 'database', 'docker', 'guide']
isPrivate: false
---

I was playing around with Linode recently to try set up a PocketBase
instance then I came across [this guide] on the PocketBase GitHub
discussions.

The whole thing took around ten minutes and I now have a SQLite
database I can read/write to.

There's a lot more I'll need to do to get a project running but this
was one thing I wanted to make sure I could do before progressing.

Anyways I'll go through the steps I did to get set up so I can refer
back to it when I need it again!

A lot of this guide will be verbatim from the GitHub discussion linked
earlier!

There'll be a lot of terminal commands!

## Set up PocketBase Dockerfile

First thing I'll do is set up a project folder on my machine which
will have the Docker file in it to run the PocketBase instance.

```bash
# make a directory for the project
mkdir pocketbase
# change directory into the folder
cd pocketbase
```

Then in the directory I'll create a Docker file and copypasta the
config from the GitHub discussion:

```bash
# create Dockerfile
touch Dockerfile
```

The contents of the Dockerfile are:

```docker
FROM alpine:latest

ARG PB_VERSION=0.7.6

RUN apk add --no-cache \
    unzip \
    # this is needed only if you want to use scp to copy later your pb_data locally
    openssh

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
```

So, from my limited understanding of Docker it looks like this file is
provisioning the latest version of PocketBase from the GitHub releases
page, exposing port `8080` then serving PocketBase from the `/pb`
directory.

## Set up Fly.io

I'll follow the Fly.io [install guide], I use Windows Subsystem for
Linux (WSL) with Ubuntu so I'll use the Linux install instructions.

```bash
curl -L https://fly.io/install.sh | sh
```

Then use the CLI for signup and login, signup first:

<!-- cSpell:ignore flyctl -->

```bash
flyctl auth signup
```

The CLI then directs me to create an account on Fly.io, I'll do that
then come back to the CLI and login:

```bash
flyctl auth login
```

## Set up Fly.io app

From within the project directory I'll run the following command to
set up the Fly.io app:

```bash
flyctl launch
```

This will ask me a few questions, I'll answer them as follows:

```text
? App Name (leave blank to use an auto-generated name): pocketbase
? Select region: lhr (London, United Kingdom)
? Would you like to set up a Postgresql database now? No
? Would you like to deploy now? No
```

The CLI creates a `fly.toml` in the same location as the Dockerfile
file which I'll need to edit now to add the storage volume.

## Create free 1GB storage volume

I'll use the Fly.io CLI to create a storage volume, `pb_data` is where
PocketBase writes to:

```bash
flyctl volumes create pb_data --size=1
```

I'm prompted to pick a region, I'll pick the same one I picked when I
run the `flyctl launch` command.

Now I need to add the `[mounts]` section to the `fly.toml` file:

```toml
[mounts]
  destination = "/pb/pb_data"
  source = "pb_data"
```

Here's what my full TOML file looks like after adding in the
`[mounts]` config:

<!-- cSpell:ignore sigint -->

```toml
# fly.toml file generated for pocketbase on 2022-10-02T17:22:41+01:00

app = "pocketbase"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]

[experimental]
  allowed_public_ports = []
  auto_rollback = true

[mounts]
  destination = "/pb/pb_data"
  source = "pb_data"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []
  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

## Deploy

Now to deploy the app to Fly.io with the following command:

```bash
flyctl deploy
```

That's it!

Now I can access the PocketBase instance on Fly.io at
`https://pocketbase.fly.dev/_/` there's an initial setup page which
I'll go through to set up the an admin user.

I can now start creating collections and adding users!

## Next steps

I'll be playing around with the PocketBase [JavaScript SDK] to use in
an as yet undetermined SvelteKit project.

There's still the backup and downloading of data I need to check out,
but for a quick and easy way to get a PocketBase instance up and
running this is a great way to do it!

That's it, this guide is here primarily for me to refer back to when I
need to do this again, if you find it useful feel free to share it!

There's lots more useful information covered in the GitHub discussion
as well which I'll be referring to in the future!

<!-- Links -->

[this guide]: https://github.com/pocketbase/pocketbase/discussions/537
[install guide]: https://fly.io/docs/hands-on/install-flyctl/
[javascript sdk]: https://github.com/pocketbase/js-sdk
