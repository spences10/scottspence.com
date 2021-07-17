---
date: 2021-02-14
title: Sending Emails With Twilio SendGrid
tags: ['guide', 'domains', 'email']
isPrivate: true
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Now I have a super sweet email pipeline for sending weekly emails
thanks to [Sam Larsen-Disney] I'm going to document what I've learnt
and what Sam taught me. (same thing, I guess) 😊

First up, I'd like to thank Sam for his patience walking me through
this a couple of times over now.

If you are looking to do something similar then the hope is that this
can give you an idea of what you need to do.

## Prerequisites

There's no real prerequisites here I'd say, having an email from your
custom domain is a nice touch but as far as I know not essential.

If you want to set up a custom email address to send from, I have done
this in the past with Zoho and you can check [Setting up a Custom
Email with Zoho] for details on that and also [Setting up ProtonMail
with Vercel] they're both for Vercel via the Vercel CLI.

I'll need a from on my site to collect the information with, I use
[Kews Forms] which isn't completely redundant a this point as it has
great validation that I can use.

Also it was what I had in place already, if you're interested in Kews
Forms take a look at the video here:

<YouTube youTubeId="ZSFn1lnlAZw" />

There are also other videos from friends of mine detailing the same
process:

- [Leigh Halliday]
- [James Q Quick]

## Add contacts to SendGrid

This is the code Sam kindly furnished me with, this can be gleaned
from SendGrid as well.

```js
/**
 * This is what is used to send the contact to SendGrid
 * the `list_ids` is from my contacts list in SendGrid
 * that is the id of my Newsletter list
 */

export default async function happyForm(email, name, list) {
  await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GATSBY_SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      list_ids: [list],
      contacts: [
        {
          email,
          first_name: name,
        },
      ],
    }),
  })
}
```

To do that, if you create a new list in your contacts then

![sendgrid empty contact list]

<!-- Links -->

[setting up a custom email with zoho]:
  https://scottspence.com/2020/04/25/custom-email-domain-with-now/
[sam larsen-disney]: https://twitter.com/SamLarsenDisney
[newsletter]: https://scottspence.com/newsletter
[leigh halliday]: https://www.youtube.com/watch?v=gK7KKswOnOQ
[james q quick]: https://www.youtube.com/watch?v=7HVM3HPhlTw
[kews forms]: https://kwes.io/
[setting up protonmail with vercel]:
  https://scottspence.com/2021/02/26/setting-up-proton-mail-with-vercel/

<!-- Images -->

[sendgrid empty contact list]: ./sendgrid-empty-contact-list.png
