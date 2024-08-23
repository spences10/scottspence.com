---
date: 2024-08-17
title: Multi-instance PocketBase setup
tags: ['pocketbase', 'database', 'caddy', 'vps', 'hetzner']
isPrivate: false
---

<!-- cSpell:ignore hetzner Coolify dearmor Caddyfile Rawdogging -->

I've been playing around with Hetzner Cloud for a while now, mainly
setting up this site on it using Coolify but it got me thinking about
using it for other things too.

I've used PocketBase before for other projects and
[documented it](https://scottspence.com/posts/set-up-free-pocketbase-db)
for use with Fly.io. This time round, I'm using a Hetzner VPS.

Now, the PocketBase binary is like 38mb so using a a VPS with a 40gb
SSD is a bit overkill for the small amount of data I'm storing for the
toy projects I'm working on. I have several small projects that I want
to use PocketBase for, so, instead of setting up a new box for each
one, I thought I'd try to set up a multi-instance setup.

## Pre-requisites

I've already done this, I'm documenting for future me. If you're
thinking about doing something similar bear in mind that I already
have a VPS box set up on Hetzner and some domains (on Cloudflare) that
I'm going to proxy to.

## Shiny new box

Aight, so, new Hetzner box, I'm going to SSH into it and update it.
Just a side note here I've started using the 1Password CLI for SSH
keys and it is _really_ handy.

Update the box:

```bash
apt update
apt upgrade -y
apt update && apt upgrade -y && apt autoremove -y
```

Yes, I'm not using a sudoers account! Rawdogging it as root. If you're
interested I go through
[Setting up my VPS on Hetzner](https://scottspence.com/posts/setting-up-my-vps-on-hetzner)
which set's up a user account on the sudoers list and removes the root
user.

## Download PocketBase

Ok, so I want to download PocketBase to the box, I'll get the latest
PocketBase binary listed on the
[PocketBase docs](https://pocketbase.io/docs/) I'm on ARM64 so I'll
get that with `wget`.

```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.19/pocketbase_0.22.19_linux_arm64.zip
```

Unzip the binary, I'm going to use `unzip`, which isn't installed by
default on Ubuntu, so I'll install it:

```bash
apt install unzip
```

## Create project directories

I'm going to create a couple of directories for the projects I'm
setting up, `rinku-cloud` and `dope-devs`.

```bash
mkdir {rinku-cloud,dope-devs}
```

Then move the PocketBase zip file into the `dope-devs` directory and
unzip it.

```bash
mv pocketbase_0.22.19_linux_arm64.zip dope-devs/
cd dope-devs/
unzip pocketbase_0.22.19_linux_arm64.zip
```

Same thing for the `rinku-cloud` directory.

```bash
mv pocketbase_0.22.19_linux_arm64.zip ../rinku-cloud/
cd ../
cd rinku-cloud/
unzip pocketbase_0.22.19_linux_arm64.zip
```

## Set up services

I want to set up two services to run on localhost for the two projects
and assign a port for each. I'll just go through the process of
setting up one service, **NOTE** that for the other service I'll need
to change the port number.

Create the service file using nano:

```bash
nano /etc/systemd/system/pocketbase-rinku-cloud.service
```

Then edit the file and add in the service details:

```bash
[Unit]
Description=PocketBase Rinku Cloud
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/root/rinku-cloud/pocketbase serve --http="127.0.0.1:8090"
WorkingDirectory=/root/rinku-cloud
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Write out the file, save it and exit. I'll then enable the service,
start it and check the status.

```bash
systemctl enable pocketbase-rinku-cloud.service
systemctl start pocketbase-rinku-cloud.service
systemctl status pocketbase-rinku-cloud.service
```

I get an output looking something like this:

```text
● pocketbase-rinku-cloud.service - PocketBase Rinku Cloud
     Loaded: loaded (/etc/systemd/system/pocketbase-rinku-cloud.service; enabled; preset: enabled)
     Active: active (running) since Sat 2024-08-17 19:46:40 UTC; 1min 4s ago
   Main PID: 708 (pocketbase)
      Tasks: 8 (limit: 4433)
     Memory: 44.6M (peak: 44.9M)
        CPU: 619ms
     CGroup: /system.slice/pocketbase-rinku-cloud.service
             └─708 /root/rinku-cloud/pocketbase serve --http=127.0.0.1:8090
```

## Install and config Caddy

I'm going to go to the
[Caddy documentation for Ubuntu](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)
and copy pasta the commands for installing Caddy.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Change directory into the `etc` folder and create a `Caddyfile`.

```bash
cd /etc/caddy/
nano Caddyfile
```

In the `Caddyfile` I'm going to add in the two domains I'm proxying
**NOTE** that I have already added an `A` record for `pb` in my DNS
records for the domains that points back to my Hetzner IP address.

```js
pb.rinku.cloud {
  reverse_proxy localhost:8090
}

pb.dopedevs.icu {
  reverse_proxy localhost:8091
}
```

Write out the file, save it and exit. I'll then enable the Caddy
service, start it and check the status.

```bash
systemctl enable caddy
systemctl start caddy
systemctl status caddy
```

## Login to PocketBase

Now my services are running I can now login to PocketBase for each of
the projects and get them configured how I want.

## Conclusion

I've now got a multi-instance PocketBase setup running on Hetzner
Cloud with Caddy as a reverse proxy.
