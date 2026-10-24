---
date: 2026-10-18
updated: 2026-10-22
title:
  'Coolify Dashboard Broken After Upgrade? Purge Two Files in
  Cloudflare'
tags: ['notes', 'guide', 'cloudflare']
is_private: false
---

I've upgraded Coolify twice this week, on two different servers, and
both times the dashboard was unusable afterwards. The fix both times
was purging two JavaScript files from the Cloudflare cache. This is a
note for future me, and for anyone else running Coolify behind
Cloudflare.

## What it looks like

After the upgrade finished, the dashboard loaded but nothing worked.
Clicking around did nothing, and there was a "Cannot connect to
real-time service" banner at the bottom of the page.

[![coolify dashboard with cannot connect to real-time service error](https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/scottspence.com/coolify-cannot-connect-to-real-time-service.png)](https://res.cloudinary.com/defkmsrpw/image/upload/scottspence.com/coolify-cannot-connect-to-real-time-service.png)

The server itself was fine. All the containers were up and healthy, my
sites were responding, and the browser console showed JavaScript
failing on `privateChannel`.

## What's going on

The Coolify dashboard loads two files from fixed URLs:

- `/js/echo.js`
- `/js/pusher.js`

There's no hash or version in the file names, and Coolify doesn't send
any cache headers for them. With no cache headers, Cloudflare caches
`.js` files for its
[default edge TTL](https://developers.cloudflare.com/cache/how-to/configure-cache-status-code/)
of two hours.

The upgrade button is in the dashboard, so those files are already in
the Cloudflare cache when the upgrade starts. On my server the cached
copy of `echo.js` was from a minute before I clicked upgrade.

I went from `4.0.0-beta.459` to `4.4.6`. Somewhere in between, the
separate `coolify-realtime` container went away and the real-time
service moved into Coolify itself. The old `echo.js` doesn't work with
the new setup, so the dashboard falls over on load.

A hard refresh doesn't fix it. That only skips the copy in the
browser, Cloudflare still serves the old file.

## The fix

In the Cloudflare dashboard for the domain Coolify runs on:

1. Go to **Caching** > **Configuration**.
2. Click **Custom Purge** and pick **URL**.
3. Add both files, one per line:

```text
https://your-coolify-domain/js/echo.js
https://your-coolify-domain/js/pusher.js
```

4. Click **Purge**, then hard reload the dashboard.

That's it, no need to restart anything on the server. I did restart my
Hetzner server first, which didn't help, because the problem was never
on the server.

To check it's worked, compare the file Cloudflare serves with the one
on the server:

```bash
# through Cloudflare
curl -s https://your-coolify-domain/js/echo.js | md5sum

# on the server
curl -s http://localhost:8000/js/echo.js | md5sum
```

If the hashes match, you're good. You can also look at the
`cf-cache-status` and `last-modified` headers with `curl -I`. Before
the purge mine showed `HIT` with a `last-modified` from December 2025.

The other option is to wait two hours for the cache to expire.

## Upgrade not happening at all? Check Docker

On a third server the upgrade didn't break the dashboard, it just
didn't happen. I'd click upgrade, wait, and still be on
`4.0.0-beta.452`. The nightly auto-update had been failing the same
way.

The upgrade script writes a log for every attempt in
`/data/coolify/source/`, so that's the place to look:

```bash
ls -t /data/coolify/source/upgrade-*.log | head -1 | xargs tail -n 20
```

Mine stopped at step 2 of 6 with this:

```text
ERROR: Docker Engine 27.0.3 reports the gateway of the 'coolify'
network as fd00::1/64, which Coolify cannot read (Docker
Engine bug, fixed in 28.0.1). Run 'systemctl restart docker' (this
restarts all containers) or upgrade Docker Engine, then upgrade
Coolify again.
```

Docker 27 reports the IPv6 gateway with the `/64` on the end, and the
upgrade script won't continue. Restarting Docker is the quick fix, but
upgrading Docker means it won't happen again. Either way every
container on the server restarts, so your sites go down for a few
seconds.

The server is Ubuntu 24.04 with Docker from Docker's apt repo, so I
pinned it to the latest 28.x release:

```bash
V=5:28.5.2-1~ubuntu.24.04~noble
apt-get update
apt-get install --only-upgrade \
  docker-ce=$V docker-ce-cli=$V docker-ce-rootless-extras=$V
```

After that, `docker network inspect coolify` showed the gateway as
`fd00::1` with no `/64`. Then I ran the upgrade again from the server:

```bash
cd /data/coolify/source
curl -fsSL https://cdn.coollabs.io/coolify/upgrade.sh -o upgrade.sh
bash upgrade.sh 4.4.7 latest ghcr.io
```

It went through this time and Coolify came back on `4.4.7`. And yes,
the dashboard then needed the same two files purged from Cloudflare.

If you also run `apt upgrade` for security patches, it'll move Docker
to the next major version (29). If you'd rather stay on 28, hold the
packages:

```bash
apt-mark hold docker-ce docker-ce-cli docker-ce-rootless-extras
```

A hold also blocks Docker security fixes, so `apt-mark unhold` them
when you're ready to move on.

## Stopping it happening again

I haven't done this yet, but a Cloudflare Cache Rule that bypasses the
cache for `/js/echo.js` and `/js/pusher.js` on the Coolify hostname
should stop it from happening on the next upgrade. The files are small
and only the dashboard loads them, so skipping the cache costs
nothing.

## Conclusion

If your Coolify dashboard is broken after an upgrade and you're behind
Cloudflare, check the cache before you check the server. Purging two
URLs fixed it for me on both servers.
