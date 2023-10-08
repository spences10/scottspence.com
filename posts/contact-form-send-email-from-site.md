---
date: 2023-10-07
title: Contact Form Send Email From Site with Fastmail
tags: ['fastmail', 'guide', 'resource', 'email']
isPrivate: true
---

<!-- cSpell:ignore jmap, smtps, reqd, rcpt, webjeda -->

What a catchy title! So, I thought it'd be a good idea to completely
move away from using Airtable. I used Airtable for my short URL
service I created and for various config options for the [Let's Work
Together] page on my site. I moved them all to Upstash Redis except
for the contact form.

I have had several on setting up a contact form with SvelteKit which
[I have done in the past]. This time I'll be using `nodemailer` and
Fastmail. I've been a Fastmail user for a while now and I wanted to
skip the Airtable automation and use Fastmail to send the email from
the contact form on my site to me. If you're interested in checking
out Fastmail you can use my [referral link] to get 10% off your first
year.

The inspiration for this comes from a [WebJeda video], Sharath is a
great educator for Svelte with a lot of content on his YouTube
channel.

I absolutely love Fastmail! There's a [tag for it] on it on the site
if you want to see some more content form me on it!

## App password is the way

This post was initially me trying to document my way around using the
Fastmail API. I tried to use the JMAP API to send the email but I
couldn't get it to work other than creating a draft email. 😅

I ended up using an app password to send the email. Again like I did
with the API key, I did a bit of validation with `curl` first, I set
the app password into a variable and then used that variable in the
`curl` command.

The app password is set up in the Fastmail settings, you can find it
under the `Privacy & Security > Integrations` section.

For the new app password the name was a custom name, and selected the
"Mail (IMAP/POP/SMTP)" option, then generated the password.

The `curl` command looked something like this.

```bash
export APP_PASSWORD="my-app-password"

curl --url "smtps://smtp.fastmail.com:465" --ssl-reqd \
 --mail-from "myfastmail@fastmail.com" --mail-rcpt "recipient@receiver.com" \
 --user "myfastmail@fastmail.com:$APP_PASSWORD" \
 -T email.txt
```

The `email.txt` file contains the email headers and body, so something
like this.

```text
From: Sender Name <myfastmail@fastmail.com>
To: Receiver Name <recipient@receiver.com>
Subject: Test Email Subject

This is the body of the test email.
```

Sending that off with `curl` sends the email to the recipient.

Ok, now I've validated I can send and email with `curl` I can move on
to the contact form.

## Using a SvelteKit action

So like I did with [Switching from Brevo to Buttondown] I'm using a
SvelteKit action to send the email. The reasoning is the same as with
the newsletter sign up form, I want to be able to use the contact form
in a few places on the site as a component. I already have a
pre-existing `/contact` route, so I'll create a `+page.server.ts` file
in there for the action.

Here's the first pass where I hard-code in the email values, I'll get
these off of the `request` eventually but for now I want to send
something via a button click on a form.

```ts
import {
  EMAIL_APP_PASSWORD,
  EMAIL_APP_TO_ADDRESS,
  EMAIL_APP_USER,
} from '$env/static/private'
import { fail } from '@sveltejs/kit'
import nodemailer from 'nodemailer'

export const actions = {
  default: async () => {
    try {
      const name = 'scott'
      const email = 'scott@scott.com'
      const reason = 'laptop'
      const message = 'laptop pls'

      // Create a transporter object using the nodemailer library
      const transporter = nodemailer.createTransport({
        host: 'smtp.fastmail.com',
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_APP_USER,
          pass: EMAIL_APP_PASSWORD,
        },
      })

      // Set up email data
      const mail_options = {
        from: `"${name}" <${email}>`,
        to: EMAIL_APP_TO_ADDRESS,
        subject: reason,
        text: message,
      }

      // Send email
      const info = await transporter.sendMail(mail_options)

      return {
        status: 200,
        body: {
          message: 'Email sent successfully',
          messageId: info.messageId,
        },
      }
    } catch (error) {
      return fail(500, {
        error: 'Internal server error',
      })
    }
  },
}
```

Essentially what happening here is that the SMTP server is being
created with the `nodemailer` library, then the email data is set up
and finally the email is sent via the `sendMail` method.

I have `EMAIL_APP_PASSWORD` as the app password I created earlier,
`EMAIL_APP_TO_ADDRESS` is the email address I want to send the email
to and `EMAIL_APP_USER` is the email address I'm sending the email
from.

Ok, now to set up a simple form to test the email being sent.

Essentially I just want to trigger the action on a button click, so
something like this.

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
</script>

<form
  method="POST"
  action="/contact"
  use:enhance={() => {
    return ({ update, result }) => {
      console.log('=====================')
      console.log(result)
      console.log('=====================')
      update({ reset: true })
    }
  }}
>
  <input type="submit" value="test!" />
</form>
```

Note that I'm pointing to the `action` to the `/contact` route. This
will trigger the `default` action in the `+page.server.ts`.

I'm logging out the `result` of the action, to see what I get back on
the client.

The `result` object looks like this.

```json
{
  "type": "success",
  "status": 200,
  "data": {
    "status": 200,
    "body": {
      "message": "Email sent successfully",
      "messageId": "<05edaa60-e727-61de-f288-d8d28785c45f@scott.com>"
    }
  }
}
```

<!-- Links -->

[let's work together]: https://scottspence.com/lets-work-together
[tag for it]: https://scottspence.com/tags/fastmail
[referral link]: https://ref.fm/u27421800
[Switching from Brevo to Buttondown]:
  https://scottspence.com/posts/switching-from-brevo-to-buttondown
[I have done in the past]:
  https://scottspence.com/posts?search=contact%20form
[webjeda video]: https://www.youtube.com/watch?v=qa-Sh0iM-kM
