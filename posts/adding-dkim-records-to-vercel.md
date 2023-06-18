---
date: 2023-01-09
updated: 2023-04-25
title: Adding DKIM records to Vercel
tags: ['domains', 'guide', 'resource']
isPrivate: false
---

<script>
  import { Banner } from '$lib/components'

  const options = {
    type: 'info',
    message: `This is my misunderstanding of how to use the Vercel CLI!
      Me using the <code>@</code> as a name refers to the domain. I've
      added an <a href="#update">update</a> to the end of the post to clarify this.
    `
  }
</script>

So, I've started using Sendinblue for my transactional emails and
newsletter. There's the usual configuration to do with these services
to add and configure your domain with them to show it as the sender.

I've documented that process of [Setting up Fastmail with Vercel] in
the past which I was familiar with.

This time around I had to add DKIM records to my domain to get this
working. I've not done this before so I thought I'd write a quick
guide on how I did it.

Adding a domain to Sendinblue there's several records that need adding
to your DNS which they list out in a table. `Sendinblue code`,
`DKIM record` and `SPF record`, all `TXT` records.

These all seemed straightforward enough to me, use the Vercel CLI to
add in all the `TXT` records with the `dns add` CLI commands.

Example:

```bash
vc dns add yourdomain.com @ TXT 'sendinblue-code:valueFromSendinblue'
```

I add in all the `TXT` records with the Vercel CLI and check the the
Sendinblue dashboard to see if they're verified, I get the following:

<!-- cSpell:ignore yourdomain,domainkey -->

| Sendinblue code | We need to verify your domain       |     |
| --------------- | ----------------------------------- | --- |
| Type            | TXT                                 |
| Hostname        | yourdomain.com                      |
| Value           | sendinblue-code:valueFromSendinblue | ✔️  |

| DKIM record | We need to authenticate your domain |     |
| ----------- | ----------------------------------- | --- |
| Type        | TXT                                 |
| Hostname    | mail.\_domainkey.yourdomain.com     |
| Value       | k=rsa;p=valueFromSendinblue         | ❌  |

| SPF record | We need to authenticate your domain       |     |
| ---------- | ----------------------------------------- | --- |
| Type       | TXT                                       |
| Hostname   | yourdomain.com                            |
| Value      | v=spf1 include:spf.sendinblue.com mx ~all | ✔️  |

Fine for the hostnames that matched the apex domain (in this example
that's `yourdomain.com`), but when it came to the
`mail._domainkey.yourdomain.com` hostname it wasn't verified.

I was able to validate the `TXT` record had been added and propagated
with [DNSChecker] but it wasn't verified on the Sendinblue dashboard.

Why?

The Sendinblue dashboard was expecting all these `TXT` records to be
added which I did. The hostname for the `DKIM record` I added like
this:

```bash
vc dns add mail._domainkey.yourdomain.com @ TXT 'k=rsa;p=valueFromSendinblue'
```

I just expected the CLI to add the hostname record for me. 😅

<Banner {options} />

A closer look at the output from the Vercel CLI (with the command
`vc dns yourdomain.com`) showed that the `TXT` record was under the
apex domain and not `mail._domainkey.yourdomain.com`.

So, I had to add the `CNAME` (Canonical Name) subdomain record for the
`mail._domainkey.` hostname with the Vercel CLI first.

```bash
vc dns add yourdomain.com mail._domainkey CNAME yourdomain.com
```

That command creates the subdomain `mail._domainkey` on
`yourdomain.com` and redirects it to the apex domain.

Then, (after removing the existing `TXT` record) I can add it again,
this time for the `mail._domainkey.yourdomain.com` hostname.

```bash
vc dns add mail._domainkey.yourdomain.com @ TXT 'k=rsa;p=valueFromSendinblue'
```

Verify on [DNSChecker] that the `TXT` record has propagated and then
go back to the Sendinblue dashboard and check to see if it's verified.

| Sendinblue code | We need to verify your domain       |     |
| --------------- | ----------------------------------- | --- |
| Type            | TXT                                 |
| Hostname        | yourdomain.com                      |
| Value           | sendinblue-code:valueFromSendinblue | ✔️  |

| DKIM record | We need to authenticate your domain |     |
| ----------- | ----------------------------------- | --- |
| Type        | TXT                                 |
| Hostname    | mail.\_domainkey.yourdomain.com     |
| Value       | k=rsa;p=valueFromSendinblue         | ✔️  |

| SPF record | We need to authenticate your domain       |     |
| ---------- | ----------------------------------------- | --- |
| Type       | TXT                                       |
| Hostname   | yourdomain.com                            |
| Value      | v=spf1 include:spf.sendinblue.com mx ~all | ✔️  |

So, essentially there should have been some extra steps on the
Sendinblue dashboard, to add a subdomain.

Speaking with support they about this, they usually always speak with
users that have a dashboard of some sort. Speaking with me (using a
CLI) they didn't really have a reference point to work from, so it was
guesswork on my side.

Done!

## Update

I didn't need to go through adding the `CNAME` record for the domain.

All I needed to do was add the `TXT` record and not use the `@` and
instead use the name of the record I wanted to add.

The `@` as a name refers to the domain, so I was adding the domain
twice and essentially adding a blank record. This explains why there
was no name for the `TXT` record.

So, the command to add the `TXT` record for the `DKIM record` should
have been:

```bash
vc dns add yourdomain.com mail._domainkey TXT 'k=rsa;p=valueFromSendinblue'
```

Thanks.

Done! Done! 😅

<!-- Links -->

[setting up fastmail with vercel]:
  https://scottspence.com/posts/setting-up-fastmail-with-vercel
[dnschecker]: https://dnschecker.org/
