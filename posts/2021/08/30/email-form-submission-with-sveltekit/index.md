---
date: 2021-08-30
title: Make an Email Form Submission with Sveltekit
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: true
---

<script>
  import NewsletterSignup from '$lib/components/newsletter-signup.svelte'
</script>

Bit of preamble before I kick this off, subscribers to my newsletter
will know that I've been through a couple of platforms now (Zoho,
SendGrid, Revue then Substack). I settled on Substack because of the
editing experience what I didn't want to settle on was the janky embed
you get with Substack.

Check it out!

<iframe
  title="substack_subscribe"
  src="https://spences10.substack.com/embed"
  width="100%"
  height="320"
  style="border:1px solid #EEE; background:transparent;"
  frameborder="0"
  scrolling="no"
/>

Depending on what theme you're using this can potentially be
acceptable, probably not though!

I did get my own custom form working with Substack locally. The
**Tl;Dr** is I popped open the network tab in the browser and made a
note of where the submission was going and checked out the payload so
I could try make a similar submission with Insomnia. This worked
locally! But on deploying to Vercel the submit wasn't working and I
went back to using the Substack embed. Sad times!

## Revue has an open API

Then I remembered that Revue had an open API with docs and everything
so I created an account (I deleted my old one) and used Insomnia to
try out some of the API methods, it worked locally with Insomnia!

So I swapped out the Substack endpoint with the Revue one deployed it
to Vercel and tried it out. I could add new subscribers to my Revue
account! Joy! Ok onto the how to!

## Testing the Revue endpoint

Because Revue has an open API that means there's ✨[documentation]✨

If you're following along you will need your Revue API key, you can
find it at the bottom of the [integrations] page.

Scroll to the bottom and look for something like this:

<div style="text-align:center;">
<br />

Your API key is `2f09ecd9-6a64-4d5b-9c77-a5587cedbcf7`.

Usage of the API must follow Revue’s [Terms of Service] and [Privacy
Policy].

<br />
</div>

⚠️ Usual warning about exposing API keys here, there doesn't seem to
be a way to generate a new Revue API key, so if it's leaked somewhere
I'm not sure how you'd go about revoking it.

Using Insomnia the first thing I did was check out the POST method
with `https://www.getrevue.co/api/v2/subscribers` the request body was
this:

```json
{
  "email": "spences10apps+test@gmail.com",
  "first_name": "",
  "last_name": "",
  "double_opt_in": false
}
```

As a side note you can add a `+` to the end of an email address in
Gmail to give it a unique name. So in the case of the example `+test`
is what I'm using as a way to identify the email address.

The Bearer token looked like this `Token <your-api-key>`.

Hit Send button and wait for the response! I get a 200 OK with the
preview reply looking something like this:

```json
{
  "id": 5654821249,
  "list_id": 216568,
  "email": "spences10apps+test@gmail.com",
  "first_name": "",
  "last_name": "",
  "last_changed": "2021-08-31T20:10:24.197Z"
}
```

Alright, sweet! I can now add a subscriber to my Revue account via the
Revue API!

## Setup the project

In this example like the last couple of examples I've done I'll be
using Matt Jennings' [SvelteKit blog template]; it's what this site is
based off of.

ℹ️ This is for a SvelteKit project hosted on Vercel, if you're
following along then this is what I'm doing:

```bash
git clone git@github.com:mattjennings/sveltekit-blog-template.git
cd sveltekit-blog-template
npm i
```

Matt's example uses the SvelteKit `adapter-static` and because I'm
deploying to Vercel I'll need to install `adapter-vercel` and add that
in the `svelte.config.js`:

```bash
# uninstall adapter-static
npm un @sveltejs/adapter-static
# install adapter-vercel
npm i @sveltejs/adapter-vercel@next
```

Then it's a case of swapping out the first line here `adapter-static`
with `adapter-vercel`:

```js
import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'
import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    mdsvex(mdsvexConfig),
    [
      preprocess({
        postcss: true,
      }),
    ],
  ],

  kit: {
    target: '#svelte',
    adapter: adapter(),
  },
}

export default config
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV
const dev = mode === 'development'
process.env.TAILWIND_MODE = dev ? 'watch' : 'build'
```

The rest of the config here isn't really pertenant, what matters is
that I have swapped out `adapter-static` with `adapter-vercel` I've
literally copied the code of what I'm working on.

## Setting up environment variables

Because I'm going to be using an API key I don't want exposed there's
a few things I'll need to do!

First is to add `.env` to the `.gitignore` file. For some reason this
isn't in the default skeleton you make with `npm init svelte@next`
project so I'll be adding `.env` to the `.gitignore` file. I'll be
doing this via the terminal, you can edit the file manually if you
like:

```bash
echo .env >> .gitignore
```

SvelteKit uses [Vite] and you can prefix you environment variables
with `VITE_` so they're available to the client (the browser) this
also means that they can be seen from the client.

Although the code for an endpoint runs on the server and adding the
`VITE_` means that you can access the variable in development mode it
_shouldn't_ be exposed to the client **but** I prefer to use
`process.env` to access the variables.

I've made a short post on how to use [`.env` secrets in SvelteKit] if
you need a bit more detail on that.

I'm going to install `env-cmd` and add that to the dev script, first
up install the package:

```bash
npm i -D env-cmd
```

Then add it to the dev script:

```json
"scripts": {
  "dev": "env-cmd svelte-kit dev",
```

No I can access environment variables in development mode.

## Setting up the endpoint

Now I'll need to set up the endpoint to submit the email to the Revue
API. I'll do this in the terminal:

```bash
# make the directory
mkdir src/routes/email-submit
# create the file
touch src/routes/email-submit/index.json.js
```

Now for the endpoint `post` function!

Now I can scaffold ou the function to submit the email to the Revue
API.

For now, to test it's worked I'll hardcode in the email address to the
`POST` body, then I'll build on that once I've validated it's working.

```js
export async function post() {
  const API_KEY = process.env['REVUE_API_KEY']

  await fetch('https://www.getrevue.co/api/v2/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'spences10apps+test@gmail.com',
      first_name: '',
      last_name: '',
      double_opt_in: false,
    }),
  })
  return {
    status: 200,
    body: JSON.stringify({
      message: 'Email sent!',
    }),
  }
}
```

One thing to note is that I'm not asking for a first or last name and
that I'm not requiring users to double opt in (i.e. reply to another
email to say yes sign me up to the list I've just subscribed to).

```js
body: JSON.stringify({
  email: 'spences10apps+test@gmail.com',
  first_name: '',
  last_name: '',
  double_opt_in: false,
})
```

If you want you can do what you like with these options, my aim is to
remove as much friction as possible.

Sweet! Now that the endpoint is set up I can test it by submitting a
request from a page.

## Setting up the submit form

I'm going to create a sign up component and then use that on the index
page of the project, first I'll create the component in the `lib`
folder:

```bash
touch src/lib/components/signUp.svelte
```

Then add the following script to the component:

```svelte
<script>
  let success
  let email = ''

  async function submitForm() {
    try {
      const submit = await fetch('/submit-email.json', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      const data = await submit.json()

      success = data
    } catch (error) {
      return {
        status: 500,
        body: {
          error: 'Big oof! Sorry',
        },
      }
    }
  }
</script>
```

So this is setting up the call to the endpoint using the browser fetch
API to the endpoint `/submit-email.json` then setting the `success`
variable if there's no issues.

In the body of the component I'll add the form and the submit button,
the project uses Tailwind so I've added some minimal styles:

```svelte
<div class="mb-10">
  {#if success}
    <div class="mx-auto text-center">
      <h3 class="font-extrabold text-3xl">You have signed up!</h3>
      <p class="mt-4 text-lg">There'll be an email from me soon™️</p>
    </div>
  {:else}
    <div class="mx-auto">
      <div class="text-center">
        <h3 class="font-extrabold text-3xl">
          Sign up for the newsletter
        </h3>
        <div class="form-control">
          <form on:submit|preventDefault={submitForm}>
            <label for="email" class="label">
              <span class="sr-only label-text">Your Email</span>
            </label>
            <div>
              <input
                id="email"
                type="email"
                name="email"
                autocomplete="email"
                required
                bind:value={email}
              />
              <input type="submit" class="btn btn-secondary" />
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}
</div>
```

The main part to note here is in the `<form>` element and the call to
`submitForm` via `on:submit|preventDefault={submitForm}`. this is
going to call the `submitForm` function defined in the `<script>` at
the top of the component.

## Test the submit

Time to add an email to the form and hit submit!

<!-- Links -->

[sveltekit blog template]:
  https://github.com/mattjennings/sveltekit-blog-template
[documentation]: https://www.getrevue.co/api#get-/v2/lists
[integrations]: https://www.getrevue.co/app/integrations
[terms of service]: https://www.getrevue.co/terms
[privacy policy]: https://www.getrevue.co/privacy/platform
[vite]: https://vitejs.dev/
[`.env` secrets in sveltekit]:
  https://scottspence.com/posts/sveltekit-env-secrets
