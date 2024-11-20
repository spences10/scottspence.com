---
date: 2023-10-07
title: Contact Form Send Email From Site with Fastmail
tags: ['fastmail', 'guide', 'resource', 'email']
is_private: false
---

<!-- cSpell:ignore jmap, smtps, reqd, rcpt, webjeda -->

What a catchy title! So, I thought it'd be a good idea to completely
move away from using Airtable. I used Airtable for my short URL
service I created and for various config options for the [Let's Work
Together] page on my site. I moved them all to Upstash Redis except
for the contact form.

I have several posts on setting up a contact form with SvelteKit which
[I have done in the past]. This time I'll be using `nodemailer` and
Fastmail. I've been a Fastmail user for a while now and I wanted to
drop the Airtable automation and use Fastmail to send the email from
the contact form on my site to me. If you're interested in checking
out Fastmail you can use my [referral link] to get 10% off your first
year.

The inspiration for this comes from a [WebJeda video], Sharath is a
great educator for Svelte with a lot of content on his YouTube
channel.

I absolutely love Fastmail! There's a [tag for it] on it on the site
if you want to see some more content from me on it!

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

Note that I'm pointing the `action` to the `/contact` route. This will
trigger the `default` action in the `+page.server.ts` file.

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
      "messageId": "<jk43sfdf-a757-61fe-e288-m8d28785e45f@scott.com>"
    }
  }
}
```

Neat! Now I can start scaffolding out the rest of the markup for the
form. One important thing to remember when you're submitting a form to
an action is that you need to set the `name` attribute on the inputs.
This is so that the `request` object can pick up the values from the
`request.formData`.

This also means that unless I need to, there's no need to set
variables for the form values in the form, I can just use the
`request` object to get the values in the action.

I'll create a `handle_result` function to handle the `result` object
from the action. I'll also set a `success` variable to `true` if the
email is sent successfully.

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionResult } from '@sveltejs/kit'

  let action_result: ActionResult
  let success = false
  let message_type: 'error' | 'success' = 'error'

  const handle_result = (result: ActionResult) => {
    action_result = result
    if (result.type === 'success') {
      success = true
    } else if (result.type === 'failure') {
      message_type = 'error'
    }
  }
</script>

<form
  method="POST"
  action="/contact"
  enctype="multipart/form-data"
  use:enhance={() => {
    return ({ update, result }) => {
      handle_result(result)
      update({ reset: true })
    }
  }}
>
  <label for="name">
    <span>Name</span>
  </label>
  <input
    type="text"
    id="name"
    name="name"
    aria-label="name"
    placeholder="Name"
    required
  />
  <label for="email">
    <span>Email</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    aria-label="email"
    placeholder="Email"
    required
  />
  <label for="reason">
    <span>Reason</span>
  </label>
  <select id="reason" name="reason" aria-label="reason" required>
    <option disabled value="">Contact reason</option>
    <option value="hi">Say hi!</option>
    <option value="collaboration">Collaboration request</option>
    <option value="speak">Speaking opportunity</option>
  </select>
  <label for="message">
    <span>Message</span>
  </label>
  <textarea
    id="message"
    name="message"
    aria-label="message"
    placeholder="Hey! I'd love to talk about..."
    required
  />
  <button type="submit">Submit</button>
</form>
```

I'm using the `enhance` function to handle the `result` object from
the action. I'm also using the `update` function to reset the form
after it's been submitted.

If you're testing stuff out then maybe set `update({ reset: false })`
so you're not constantly re-entering the form values.

## Success / Fail message

Aight! So, using the result object from `enhance` I can set a
`success` variable to `true` if the email is sent successfully.

This means that I can conditionally render a success message if the
email is sent successfully.

Now, rather than have the code for several different messages in the
markup I'll create a success and failure component to handle the
different messages.

Just a preference of mine to keep the Svelte files a little less
cluttered.

Here's the file structure I'm going to use.

```text
├── src
│   ├── lib
│   │   └── components
│   │       ├── contact-form
│   │       │   ├── contact-form-failure.svelte
│   │       │   ├── contact-form-fields.svelte
│   │       │   ├── contact-form-success.svelte
│   │       │   ├── contact-form.svelte
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── routes
│   │   ├── contact
│   │   │   ├── +page.server.ts
│   │   │   └── +page.svelte
│   │   ├── +layout.svelte
│   │   └── +page.svelte
```

You can check out the [example repo] for the full code.

Success and failure components are almost identical, but the failure
component can have the `error` object passed in to it to give a bit
more information to the user.

**`contact-form-success.svelte`**

```svelte
<h3>Success!</h3>

<p>This is the message.</p>

<p>On successful submit!</p>
```

**`contact-form-failure.svelte`**

```svelte
<h3>Failure!</h3>

<p>This is the message.</p>

<p>On failed submit!</p>
```

## Conditional render the success / failure components

Ok, so, now, in the `contact-form.svelte` file I can import the
success fail and the fields components and conditionally render them
based on the `success` variable.

So, `contact-form.svelte` was the main form, now I've abstracted out
all the inputs to the `contact-form-fields.svelte` file but I'm
keeping the `handle_result` function in the `contact-form.svelte` file
so that I can use the `success` variable to conditionally render the
success or failure components.

I've added in a `spin` transition to the success and failure that was
taken straight from the [learn.svelte.dev tutorial for custom CSS
transitions].

```svelte
<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit'
  import { elasticOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'
  import ContactFormFailure from './contact-form-failure.svelte'
  import ContactFormFields from './contact-form-fields.svelte'
  import ContactFormSuccess from './contact-form-success.svelte'

  let action_result: ActionResult
  let success = false
  let message_type: 'error' | 'success' = 'error'

  const handle_result = (result: ActionResult) => {
    action_result = result
    if (result.type === 'success') {
      success = true
    } else if (result.type === 'failure') {
      message_type = 'error'
    }
  }

  // https://learn.svelte.dev/tutorial/custom-css-transitions
  export const spin = (
    node: HTMLDivElement,
    { delay, duration }: { delay: number; duration: number },
  ) => {
    return {
      delay,
      duration,
      css: (t: any) => {
        const eased = elasticOut(t)
        return `
          transform: scale(${eased}) rotate(${eased * 360}deg);
          `
      },
    }
  }
</script>

{#if success}
  <div in:spin={{ delay: 900, duration: 1400 }}>
    <ContactFormSuccess />
  </div>
{:else if action_result?.type === 'failure'}
  <div in:spin={{ delay: 900, duration: 1400 }}>
    <ContactFormFailure />
  </div>
{:else}
  <div out:fade={{ delay: 200, duration: 400 }}>
    <ContactFormFields {handle_result} />
  </div>
{/if}
```

The `contact-form-fields.svelte` file looks like this now:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
  export let handle_result: Function
</script>

<form
  method="POST"
  action="/contact"
  enctype="multipart/form-data"
  use:enhance={() => {
    return ({ update, result }) => {
      handle_result(result)
      update({ reset: true })
    }
  }}
>
  <label for="name">
    <span>Name</span>
  </label>
  <input
    type="text"
    id="name"
    name="name"
    aria-label="name"
    placeholder="Name"
    required
  />
  <label for="email">
    <span>Email</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    aria-label="email"
    placeholder="Email"
    required
  />
  <!-- honeypot -->
  <input
    type="text"
    name="subject"
    id="subject"
    class="hidden"
    value=""
  />
  <label for="reason">
    <span>Reason</span>
  </label>
  <select id="reason" name="reason" aria-label="reason" required>
    <option disabled selected value="">Contact reason</option>
    <option value="hi">Say hi!</option>
    <option value="collaboration">Collaboration request</option>
    <option value="speak">Speaking opportunity</option>
  </select>
  <label for="message">
    <span>Message</span>
  </label>
  <textarea
    id="message"
    name="message"
    aria-label="message"
    placeholder="Hey! I'd love to talk about..."
    required
  />
  <button type="submit">Submit</button>
</form>
```

I've removed all the Tailwind classes for brevity, just note that the
honeypot field should be hidden with CSS classes.

Oh, the honeypot! About that...

## Honeypot

Soon after deploying the form I started getting spam emails, I
implemented a honeypot to try and catch the spam bots.

Admittedly something I never got with using the Airtable automations
so I'm guessing they may have had some spam filtering in place on
Airtable with certain IP addresses blocked.

For the honeypot I added a hidden input field to the form and then
checked for it's value in the action. This is a simple check to see if
the field has a value, if it does then it's a spam bot that's filled
in the field.

```svelte
<!-- honeypot -->
<input type="text" name="subject" id="subject" class="hidden" />
```

On the server side I check for the `subject` field and if it has a
value then I'll short-circuit the action and return an early 200
status code and success message.

```ts
if (subject) {
  // Honeypot
  return {
    status: 200,
    body: {
      message: 'Email sent successfully',
    },
  }
}
```

This isn't a foolproof way of catching spam but it's a start.

The full `+page.server.ts` file looks like this:

```ts
import {
  EMAIL_APP_PASSWORD,
  EMAIL_APP_TO_ADDRESS,
  EMAIL_APP_USER,
} from '$env/static/private'
import { fail } from '@sveltejs/kit'
import nodemailer from 'nodemailer'

export const actions = {
  default: async ({ request }) => {
    try {
      const data = await request.formData()
      const name = data.get('name')?.toString()
      const email = data.get('email')?.toString()
      const subject = data.get('subject')?.toString()
      const reason = data.get('reason')?.toString()
      const message = data.get('message')?.toString()

      if (subject) {
        // Honeypot
        return {
          status: 200,
          body: {
            message: 'Email sent successfully',
          },
        }
      }

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

## Vercel edge functions

If you're using Vercel edge functions on your site then you'll need to
export the `runtime` for Vercel serverless config, add the config to
the `+page.server.ts` file.

```ts
export const config: ServerlessConfig = {
  runtime: 'nodejs18.x',
}
```

Otherwise you should be golden, the [example repo] uses
`@sveltejs/adapter-auto` and works fine.

## Example repo

I've created an [example repo] for this post, you can check out the
[demo on Vercel], it doesn't submit anywhere. You want to reach out
then please use the [contact form] here.

## Conclusion

This guide demonstrated a method to set up a contact form on a
SvelteKit application, utilising Fastmail and `nodemailer` for email
dispatch.

A form setup followed, connecting to a server action to handle
submissions, and displaying a success or failure message accordingly.

A honeypot implementation added a layer of spam protection, serving as
a simple measure against bot submissions. While not foolproof, it's a
step towards reducing spam.

This process not only streamlined the contact form setup but also
created a foundation for further enhancements and integrations on my
site.

<!-- Links -->

[let's work together]: https://scottspence.com/lets-work-together
[tag for it]: https://scottspence.com/tags/fastmail
[referral link]: https://join.fastmail.com/9283c1fd
[Switching from Brevo to Buttondown]:
  https://scottspence.com/posts/switching-from-brevo-to-buttondown
[I have done in the past]:
  https://scottspence.com/posts?search=contact%20form
[webjeda video]: https://www.youtube.com/watch?v=qa-Sh0iM-kM
[example repo]:
  https://github.com/spences10/sveltekit-contact-form-example
[demo on Vercel]: https://sveltekit-contact-form-example.vercel.app
[contact form]: /contact
[learn.svelte.dev tutorial for custom CSS transitions]:
  https://learn.svelte.dev/tutorial/custom-css-transitions
