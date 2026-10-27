---
date: 2026-10-27
title: 'Put a Coolify App Port on Your Tailnet with Tailscale Serve'
tags: ['notes', 'guide', 'coolify', 'tailscale']
is_private: true
---

This site has an `/api/ingest` endpoint. It's how I run tasks on the
production server from my machine: update posts, rebuild embeddings,
take a database backup. It's protected with a bearer token, but it's
on the public internet, and I'd rather it wasn't.

So I put it on my Tailscale network instead. Same server, same Coolify
app, no new process, no new env vars. This is a note for future me on
where everything lives, because the Coolify bit is easy to miss.

## The shape of it

The app listens on port 5555 inside its container. The plan:

1. Publish that port on the server's **localhost only**.
2. Have Tailscale forward a tailnet port to that localhost port.
3. Call the endpoint over the tailnet.

Nothing new is exposed to the internet. Only machines on my tailnet
can reach it.

## Install Tailscale on the server

On the Coolify server (Ubuntu 24.04 in my case):

```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --hostname=coolify
```

`tailscale up` prints a login URL. Open it, sign in, and the server
shows up in the Tailscale admin console as `coolify`.

Then in the admin console, go to **Machines**, click the **...** menu
next to the server and pick **Disable key expiry**. Otherwise the key
expires and the server drops off the tailnet until you log in again.

I nearly went down the route of ACL tags for this. You don't need
them. Tags are for writing rules about which machines can reach which,
and tagging a machine also changes who owns it, which can break
Tailscale SSH. Disable key expiry is one click and changes nothing
else.

## Publish the port on localhost in Coolify

This is the bit I'd forget. In Coolify:

1. Open the application.
2. On the **General** page, scroll to **Internal access** and click
   **Edit networking**.
3. In the **Port mappings** field, add:

```text
127.0.0.1:3101:5555
```

4. Click **Save**, then **Redeploy** the app.

That's `host_ip:host_port:container_port`. It publishes the
container's port 5555 as port 3101 on the server, but only on
`127.0.0.1`.

The `127.0.0.1:` prefix is the important part. Leave it off
(`3101:5555`) and Docker listens on every interface, so the port is on
the public internet
([coolify#8581](https://github.com/coollabsio/coolify/issues/8581)).
Docker-published ports also skip `ufw`, so a host firewall rule won't
save you here.

After the redeploy, `docker ps` shows it:

```text
127.0.0.1:3101->5555/tcp
```

If you do this for more than one app on the server, give each one its
own host port.

## Forward the tailnet to it

On the server:

```bash
tailscale serve --bg --tcp=3101 tcp://localhost:3101
```

That's it. It runs in the background and survives a reboot. To check
or undo it:

```bash
tailscale serve status
tailscale serve --tcp=3101 off
```

`status` shows the port as "tailnet only".

## Why localhost and not the Tailscale IP

My first thought was to bind the port straight to the server's
Tailscale IP. That breaks on reboot. Docker can start before Tailscale
has its IP, the bind fails, and Docker doesn't retry it
([moby#39559](https://github.com/moby/moby/issues/39559)).

Localhost always exists, so the site never depends on Tailscale being
up. If Tailscale is down, the tailnet route is down, and the public
site carries on.

## Test it

From any machine on the tailnet:

```bash
curl -X POST http://coolify:3101/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGEST_TOKEN" \
  -d '{"task": "backup_database"}'
```

A request with a wrong token came back `401 Unauthorized`, which is
what I wanted to see. The request got all the way to the app and the
token check ran.

## The gotcha: ADDRESS_HEADER

One of my other apps sits behind the Cloudflare proxy, and it had
adapter-node's `ADDRESS_HEADER` set to `CF-Connecting-IP` so rate
limits and analytics saw the real visitor IP.

Over the tailnet, every request to it returned a 500:

```text
Error: Address header was specified with ADDRESS_HEADER=cf-connecting-ip
but is absent from request
```

Tailnet requests don't go through Cloudflare, so there's no
`CF-Connecting-IP` header, and `getClientAddress()` throws. Every
request calls it in a hook, so every request failed.

The fix was to drop `ADDRESS_HEADER` and read the header myself, which
is what this site already does:

```ts
const ip =
	event.request.headers.get('cf-connecting-ip') ??
	event.getClientAddress();
```

Cloudflare requests get the real IP, and tailnet requests fall back to
the socket address.

## References

- [Tailscale serve](https://tailscale.com/docs/reference/tailscale-cli/serve)
- [coolify#8581](https://github.com/coollabsio/coolify/issues/8581)
- [moby#39559](https://github.com/moby/moby/issues/39559)
