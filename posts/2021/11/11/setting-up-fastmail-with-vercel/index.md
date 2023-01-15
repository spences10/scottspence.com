---
date: 2021-11-11
title: Setting up Fastmail with Vercel
tags: ['domains', 'guide', 'resource', 'fastmail']
isPrivate: false
---

I've started using Fastmail, here's how I set it up with Vercel for
use with my own domains.

If you're interested in giving Fastmail a go then you can use [my
referral code] for a 10% discount on the first year of Fastmail.

I'm not going to be selling any of the features here so let's get on
with configuring it for your own domain.

From the Fastmail settings there's an option to add your own domains,
click the + Add Domain button, then enter your domain name. There'll
be a check for the domain make sure it is valid. Then you're prompted
to confirm you own the domain.

Once you have confirmed ownership you're then prompted to select the
provider, I use Namecheap so I've selected that.

I have my DNS set to Vercel from Namecheap so I can manage it all
through Vercel.

All of the settings in the Fastmail documentation I can add with the
Vercel CLI.

## MX records

```bash
vc dns add yourdomainname.com @ MX in1-smtp.messagingengine.com 10
vc dns add yourdomainname.com @ MX in2-smtp.messagingengine.com 20
```

## CNAME records

```bash
vc dns add yourdomainname.com fm1._domainkey CNAME fm1.yourdomainname.com.dkim.fmhosted.com
vc dns add yourdomainname.com fm2._domainkey CNAME fm2.yourdomainname.com.dkim.fmhosted.com
vc dns add yourdomainname.com fm3._domainkey CNAME fm3.yourdomainname.com.dkim.fmhosted.com
```

## TXT records

```bash
vc dns add yourdomainname.com @ TXT 'v=spf1 include:spf.messagingengine.com ?all'
```

## Check the changes took effect

Use the Check Now button to see if the changes have been applied. This
can take a few minutes so be patient.

<!-- Links -->

[my referral code]: https://ref.fm/u27421800
