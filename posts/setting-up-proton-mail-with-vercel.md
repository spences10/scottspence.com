---
date: 2021-02-26
title: Setting up ProtonMail with Vercel
tags: ['domains', 'guide', 'resource']
isPrivate: false
---

In this post I'm detailing how I set up my domain with ProtonMail and
Vercel, this is mainly the CLI commands that are needed to get set up
with ProtonMail and Vercel.

I've decided to give ProtonMail a shot, I have lost faith in Google
being a force for good and coming round to the notion that [I
have been their product] for the last 15 years or so. 😬

<!-- cSpell:ignore nomoregoogle -->

ProtonMail is the top rated alternative on [nomoregoogle.com] and with
end-to-end encryption and the company based in Switzerland with strict
Swiss privacy laws I think my mail is in a good place!

You can also sign up anonymously for ProtonMail when you first sign
up, all they take is a username and password then a secondary email as
a backup for account resets if needed.

## Your name @protonmail.com

You get a free account with community support which comes with a
generous 500 MB of storage, you're limited on emails and labels.

I'm not a massive sender of emails so I could have been perfectly
happy on this plan. I however wanted to utilise my scottspence.com
domain, this is why this post exists!

So I'm currently on the Plus pricing plan, this may change depending
on how this goes over the next few months now.

## Add Domain

When I first log into my ProtonMail account I'm greeted with the
familiar mailbox layout, inbox, drafts, sent etc. Because I'm adding a
domain then I need to look to the settings in the menu bar on the top
right of the page.

This takes me to `mail.protonmail.com/account` where, if you look in
the side bar you can see the option for Domains.

Once I'm in `mail.protonmail.com/domains` I can select to add my
domain and get walked through all the steps needed to get set up.

## Verify Domain

First part on there is to verify that I am the owner of the domain,
this needs to have a `TXT` record added:

<!-- cSpell:ignore dsfsu9fsd989vv -->

```bash
vc dns add yourdomainname.com @ TXT protonmail-verification=dsfsu9fsd989vv
```

## Add Addresses

Now I can add all the addresses I want associated with my domain. I'll
add in the default Scott at my domain.

There's also an option to add another address on the plan I'm on. If I
want to add more domains in the future then ProtonMail has got me with
the option to add an additional domain for an extra ~£2 a month!

## Add MX Records

Next step is to add the MX records, pretty much the same format as
with the `TXT` record:

<!-- cSpell:ignore mailsec -->

```bash
vc dns add yourdomainname.com @ MX mail.protonmail.ch 10
vc dns add yourdomainname.com @ MX mailsec.protonmail.ch 20
```

## Add SPF

I think SPF is used to stop spammers spoofing custom domains, so this
needs to be added, note that I have the values in quotes here:

```bash
vc dns add yourdomainname.com @ TXT 'v=spf1 include:_spf.protonmail.ch mx ~all'
```

## Add DKIM

Same with DKIM, this is recommend whereas SPF is strongly recommend,
I've added this as well, take note of the trailing dots on the domain
keys:

<!-- cSpell:ignore yourdomainname,domainkey -->

```bash
vc dns add yourdomainname.com protonmail._domainkey CNAME protonmail.domainkey.f98sd8f90s.domains.proton.ch.
vc dns add yourdomainname.com protonmail2._domainkey CNAME protonmail2.domainkey.f98sd8f90s.domains.proton.ch.
vc dns add yourdomainname.com protonmail3._domainkey CNAME protonmail3.domainkey.f98sd8f90s.domains.proton.ch.
```

## That's it!

<!-- cSpell:ignore DMARC -->

Wrap! That's it for this, there's an additional option to add DMARC as
well but it says if I have set the other two (SPF and DKIM) then this
should be fine to leave out and can cause issues if done incorrectly,
so I've left well alone for now!

<!-- Links -->

[nomoregoogle.com]: https://nomoregoogle.com/
[i have been their product]:
	https://quoteinvestigator.com/2017/07/16/product/
