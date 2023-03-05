---
date: 2023-01-20
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
vc dns add scottspence.com @ TXT 'v=spf1 include:spf.messagingengine.com ?all include:spf.sendinblue.com mx ~all'
```

That's it! I hope this helps someone else out there!

<!-- Links -->

[stackoverflow]: https://stackoverflow.com/a/51001395
[Email Security Standards]:
  https://www.gov.uk/government/publications/email-security-standards/sender-policy-framework-spf
[Adding DKIM records to Vercel]:
  https://scottspence.com/posts/adding-dkim-records-to-vercel
