---
date: 2023-01-20
updated: 2023-04-05
title: Adding multiple SPF records with Vercel
tags: ['domains', 'guide', 'resource']
isPrivate: false
---

So, I just found that the SPF record on my Fastmail account for
scottspence.com was throwing a verification error. I didn't really
know what the SPF record was for until this point and I had to
research why it was failing on Fastmail.

So, I did a post the other week on [Adding DKIM records to Vercel]
this is what I used to validate my domain for sending the newsletter.
I just followed the directions and didn't know that adding an
additional SPF record would invalidate the previous one for Fastmail.

There's a good explanation on the UK Government site for [Email
Security Standards] with guidance on it. There was also a
[Stackoverflow] post I found on it!

So, looking at the DNS entries on Vercel (with the Vercel CLI command
`vc dns scottspence.com`), there's two TXT records:

<!-- cSpell:ignore messagingengine -->

```bash
v=spf1 include:spf.sendinblue.com mx ~all
v=spf1 include:spf.messagingengine.com ?all
```

The Sendinblue one is first in the list so that one wins!

I had to remove both the records (with the Vercel CLI command
`vc rm rec_fromTheVercelCLIOutput`) and replace them with a combined
one:

```bash
vc dns add scottspence.com @ TXT 'v=spf1 include:spf.messagingengine.com include:spf.sendinblue.com mx ~all'
```

That's it! I hope this helps someone else out there!

**UPDATE:** I had a spam email spoofing my domain and I had to adjust
the SPF record again. I found a [SPF record checker] via a linked post
on the SO question I mentioned above.

The SPF checker found errors with the modifiers in the record. I had
`?all` modifier after the first record, I removed that and re-checked
on the SPF checker and it was all good.

I chose the most restrictive qualifier for the "all" mechanism. In my
case, I used `~all` (soft fail) instead of `?all` (neutral).

You can find the post on DMARCLY for [Can I have multiple SPF records
on my domain].

<!-- Links -->

[stackoverflow]: https://stackoverflow.com/a/51001395
[email security standards]:
  https://www.gov.uk/government/publications/email-security-standards/sender-policy-framework-spf
[adding dkim records to vercel]:
  https://scottspence.com/posts/adding-dkim-records-to-vercel
[can i have multiple spf records on my domain]:
  https://dmarcly.com/blog/can-i-have-multiple-spf-records-on-my-domain
[spf record checker]: https://dmarcly.com/tools/spf-record-checker
