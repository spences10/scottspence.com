---
date: 2020-04-25
title: Configure Custom Domain Email with Zoho and Now
tags: ['guide', 'domains']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

In this guide I'm going to cover the configuring of your custom domain
with Vercel's Now platform using the Now CLI.

I'll be primarily covering the steps you take after setting up an
account with an email provider, the email provider I'm using is [Zoho
Mail] if you don't use either of these services then this guide may
not be much use to you.

## What you'll need

- a super awesome custom domain
- a [Zoho Mail] account
- a [Vercel.co] account
- The [Now CLI] installed

It's implied that you have a machine set up for web development
already and are familiar with using the terminal.

If you need to get set up for Windows [I have written a guide]
previously on that topic.

If you're a Linux user, check out this video on getting set up:

<YouTube youTubeId="eSAsdQuQ-1o" />

## Set up an account

Zoho mail offer a 5 GB [forever free plan], so as long as you can
manage your email archiving then you are good to go.

You also get up to five users and a 25mb file attachment limit with
hosting for a single domain.

Pretty good right!

## Create an admin super user

When you sign up with [Zoho Mail] you will be prompted to create a
super admin user for your zoho account and you're given the
opportunity to set up two factor authentication (2fa).

Zoho will even tell you about their authenticator app, which is only
for authenticating with Zoho. Use this is you like, I use a 2fa app
that you can use for multiple services.

## Verify you own the domain

You will be given a code to verify that you are the owner of the
domain, which you will need to add as a `TXT` entry on your domain
with the Now CLI.

The verification token will look something like this:

<!-- cSpell:ignore zmverify -->

```bash
zoho-verification=se4567894.zmverify.zoho.eu
```

Add that to your domain DNS with the Now CLI, you can check your
domain DNS entries with the `ls` command.

```bash
# list your dns entries
now dns ls yourdomain.com
# add the zoho verification as a TXT record
now dns add yourdomain.com @ TXT zoho-verification=se4567894.zmverify.zoho.eu
```

## Add the MX records

Now to configure the `MX` records. MX records are essential to receive
emails in your domain. The MX records for your domain will look
something like this:

| Host Name | Address     | Priority |
| --------- | ----------- | -------- |
| @ / Blank | mx.zoho.eu  | 10       |
| @ / Blank | mx2.zoho.eu | 20       |
| @ / Blank | mx3.zoho.eu | 50       |

Add them much in the same way as with the verification token with the
Now CLI this time specifying an `MX` instead of `TXT` and there's a
second argument for the priority:

```bash
now dns add yourdomain.com @ MX mx.zoho.eu 10
now dns add yourdomain.com @ MX mx.zoho.eu 20
now dns add yourdomain.com @ MX mx.zoho.eu 50
```

## Set the Sender Policy Framework (SPF)

To ensure that valid emails from your domain get delivered to your
users, and spoofed emails from other spammers are identified by the
other email services, it's recommend you add an SPF record for your
domain.

This will go into a `TXT` record like with the verification token:

```bash
now dns add yourdomain.com @ TXT 'v=spf1 include:zoho.eu ~all'
```

**Note: You may need to wait a while after making these changes before
the DNS updates can be verified via Zoho.**

<!-- Links -->

[vercel.co]: https://vercel.com/signup
[zoho mail]: https://www.zoho.com/mail/
[dns integration]: https://vercel.com/integrations/dns
[domains]: https://vercel.com/domains
[now cli]: https://vercel.com/download
[pricing]: https://www.zoho.com/mail/zohomail-pricing.html
[control panel settings]:
  https://mail.zoho.eu/cpanel/index.do#orgsettings/config
[i have written a guide]:
  https://scottspence.com/posts/wsl-bootstrap-2019/
[forever free plan]: https://workplace.zoho.eu/orgsignup.do
