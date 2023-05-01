---
date: 2023-04-21
title: SvelteKit Contact Form Example with Airtable
tags: ['sveltekit', 'how-to', 'guide']
isPrivate: true
---

This is a how-to guide for adding a contact form to your SvelteKit
site using Airtable to store the submissions and notify you when there
is a new submission.

This is an update to the [previous post] I did on this, the recent
changes to how you interact with the Airtable API means that I get a
chance to revisit this and make it a little more current.

It will detail making a submission using an event handler and a
default form action.

The previous post goes over creating a new SvelteKit project and
setting up the Airtable base, for the sake of completeness I'll go
over that again here.

## Create a new SvelteKit project

To create the example project I'll scaffold out a new SvelteKit
project using the `pnpm create` command:

```bash
pnpm create svelte sveltekit-and-airtable-contact-form-example
```

I'll be picking the following options from the `create-svelte` CLI:

```text
create-svelte version 4.1.0

┌  Welcome to SvelteKit!
│
◆  Which Svelte app template?
│  Skeleton project
│
◆  Add type checking with TypeScript?
│  Yes, using TypeScript syntax
│
◆  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting
│  ◼ Add Prettier for code formatting
│  ◼ Add Playwright for browser testing
│  ◼ Add Vitest for unit testing
└
```

Then I'll need two routes for the examples `action` and
`event-handler`, I'll create the folders and files for these now along
with the `submit-form` endpoint, I'll do these via bash, if you're
following along create the files how you like:

```bash
mkdir src/routes/{action,event-handler,submit-form}
```

With the folder created I'll add in the files I need for each route:

```bash
touch src/routes/action/{+page.server.ts,+page.svelte}
touch src/routes/event-handler/+page.svelte
touch src/routes/submit-form/+server.ts
```

## Create an Airtable base

Now I 've got the files in place for the project I'll focus on getting
the Airtable base set up.

If you're new to Airtable you can [sign up for a free account] and go
through the onboarding process which will ask you some questions to
get set up with a new base.

I want a base that will store the submission from the contact form, I
have an Airtable account already so I'll create a new base from the
dashboard.

Here's what the base I created looks like. If you're following along
take note of the case of the table field names as they will need to
match the code examples:

- base name: `contact-requests`
- table name: `submissions`
- table fields: `name`, `email`, `message`
- table field types: `single line text`, `email`, `long text`

## Create Airtable API key

Create a [Personal access token]

## Create API endpoint

```ts
import {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
} from '$env/static/private'
import { json } from '@sveltejs/kit'

export const POST = async ({ request }) => {
  const { name, email, message } = await request.json()

  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/submissions`

  let data = {
    records: [
      {
        fields: {
          name,
          email,
          message,
        },
      },
    ],
  }
  const res = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (res.ok) {
    return json({
      message: 'success',
    })
  } else {
    return json({
      message: 'failed',
      status: 404,
    })
  }
}
```

## With an event handler

```svelte
<script lang="ts">
  let submission_status = ''
  const handle_submit = async (event: Event) => {
    submission_status = 'submitting'

    const form = event.target as HTMLFormElement
    const form_data = new FormData(form)
    const data = Object.fromEntries(form_data)

    const res = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const { message } = await res.json()
    submission_status = message
  }
</script>

<h2>Event handler</h2>

{#if submission_status === 'submitting'}
  <p>Submitting...</p>
{:else if submission_status === 'failed'}
  <p>Submission failed.</p>
{:else if submission_status === 'success'}
  <p>Submission success.</p>

  <button
    data-sveltekit-reload
    on:click={() => {
      submission_status = ''
    }}
  >
    Submit another?
  </button>
{:else}
  <form method="POST" on:submit|preventDefault={handle_submit}>
    <label for="name">
      <span>Name</span>
    </label>
    <input
      type="text"
      name="name"
      aria-label="name"
      placeholder="Enter your name"
      required
      autocomplete="off"
    />
    <label for="email">
      <span>Email</span>
    </label>
    <input
      type="email"
      name="email"
      aria-label="email"
      placeholder="bill@hotmail.com"
      required
      autocomplete="off"
    />
    <label for="message">
      <span>Message</span>
    </label>
    <textarea
      name="message"
      aria-label="message"
      placeholder="Message"
      required
      rows="3"
      autocomplete="off"
    />
    <input type="submit" value="Submit to Airtable" />
  </form>
{/if}

<p><a href="/" data-sveltekit-reload>Back</a></p>
```

## With an action

```ts
export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    const res = await fetch('/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const responseJson = await res.json()
    return {
      body: responseJson,
    }
  },
}
```

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'

  export let form

  $: submissionStatus = form?.body?.message
</script>

<h2>Action</h2>

{#if submissionStatus === 'submitting'}
  <p>Submitting...</p>
{:else if submissionStatus === 'failed'}
  <p>Submission failed.</p>
{:else if submissionStatus === 'success'}
  <p>Submission success.</p>

  <button
    data-sveltekit-reload
    on:click={() => {
      submissionStatus = null
    }}
  >
    Submit another?
  </button>
{:else}
  <form method="POST" use:enhance>
    <label for="name">
      <span>Name</span>
    </label>
    <input
      type="text"
      name="name"
      aria-label="name"
      placeholder="Enter your name"
      required
      autocomplete="off"
    />
    <label for="email">
      <span>Email</span>
    </label>
    <input
      type="email"
      name="email"
      aria-label="email"
      placeholder="bill@hotmail.com"
      required
      autocomplete="off"
    />
    <label for="message">
      <span>Message</span>
    </label>
    <textarea
      name="message"
      aria-label="name"
      placeholder="Message"
      required
      rows="3"
      autocomplete="off"
    />
    <input type="submit" value="Submit to Airtable" />
  </form>
{/if}

<p><a href="/" data-sveltekit-reload>Back</a></p>
```

## Airtable automation

<!-- Links -->

[previous post]:
  https://scottspence.com/posts/make-a-contact-form-with-sveltekit-and-airtable
[sign up for a free account]: https://airtable.com/signup
[Personal access token]: https://airtable.com/create/tokens
