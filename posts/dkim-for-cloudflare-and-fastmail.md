---
date: 2024-02-01
title: DKIM for Cloudflare and Fastmail
tags: ['domains', 'guide', 'resource', 'fastmail', 'cloudflare']
is_private: false
---

Real quick! I'm in the process of migrating domains to Cloudflare. I
moved [scottspence.dev](https://scottspence.dev) recently and noticed
my Fastmail DKIM wasn't configured correctly.

Cloudflare will import your DNS records when you add a domain to your
account with their defaults.

The DKIM records were imported like this:

[![proxied-dkim-records]] [proxied-dkim-records]

I removed the proxy status for each of the DKIM records.

[![proxy-status-dns-only]] [proxy-status-dns-only]

I removed the proxy status for each of the DKIM records and waited for
the DNS to propagate.

That's it, now my DKIM is configured correctly.

<!-- Images -->

[proxied-dkim-records]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1706816043/scottspence.com/proxied-dkim-records.png
[proxy-status-dns-only]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1706816043/scottspence.com/proxy-status-dns-only.png
