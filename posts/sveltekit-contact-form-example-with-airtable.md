---
date: 2023-05-21
title: SvelteKit Contact Form Example with Airtable
tags: ['sveltekit', 'how-to', 'guide']
isPrivate: true
---

This is a how-to guide for adding a contact form to your SvelteKit
site using Airtable to store the submissions and notify you when there
is a new submission.

This is an update to the [previous post] I did on this, the recent
changes to how you create access keys in the Airtable API means that I
get a chance to revisit this and make it a little more current.

It will detail making a submission using an event handler and a
default form action. Both of these examples will use built-in form
validation on the client only.

After those examples I'll go into setting up a similar example using
SvelteKit Superforms which has client and server validation with
[Zod].

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

Then I'll need to create the routes for the examples, `action`,
`event-handler`, and `super-forms`. I'll create the folders and files
for these now along with the `submit-form` endpoint, I'll do these via
bash, if you're following along create the files how you like:

```bash
mkdir src/routes/{action,event-handler,submit-form,super-forms}
```

With the folders created I'll add in the files I need for each route:

```bash
touch src/routes/action/{+page.server.ts,+page.svelte}
touch src/routes/event-handler/+page.svelte
touch src/routes/submit-form/+server.ts
touch src/routes/super-forms/{+page.server.ts,+page.svelte}
```

Now I 've got the files in place for the project I'll focus on getting
the Airtable base set up.

## Create an Airtable base

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

To be able to write data via the Airtable API I'll create a [Personal
access token] with the following scopes and access to the
`contact-requests` base:

**Scopes**

- `data.records:read` See the data in records
- `data.records:write` Create, edit, and delete records
- `schema.bases:read` See the structure of a base, like table names or
  field types

**Access**

- `contact-requests`

I'll click the 'Create token' button and copy the token value to the
clipboard.

For reference, this is what I have for the scopes and access on
Airtable:

[![airtable-create-personal-access-token]]
[airtable-create-personal-access-token]

I'll need to save the generated token into a `.env` file. I can create
a new file for that with the following command:

```bash
touch .env
echo "AIRTABLE_API_KEY=" >> .env
echo "AIRTABLE_BASE_ID=" >> .env
```

I'll add the generated `AIRTABLE_API_KEY` value to the `.env` file
there's also the `AIRTABLE_BASE_ID` value that I'll need to add to the
`.env` file, I can get that from the Airtable API docs.

The Airtable base ID is detailed in the API docs for the project. The
quickest way to get there is to click on the 'Help' link in the top
right of the Airtable dashboard and then scroll down to the end of the
panel that pops out and click on the 'API documentation' link under
the 'Additional resources' section.

This opens up documentation specific to the base I'm working with. The
ID for the base is detailed in the introduction section of the docs
with the line:

**The ID of this base is appXXXXXXXXXXXXXX.**

I'll copy the ID value and add it to the `.env` file for the
`AIRTABLE_BASE_ID`.

The Airtable API docs also detail how I can 'Create records' using the
API with curl and JavaScript examples. I'll be using these to make the
SvelteKit endpoint in the next section.

## Create API endpoint

Aight, now I'll scaffold out a SvelteKit `POST` endpoint to handle the
form submission. I've already got the `+server.ts` file I created
earlier in the `src/routes/submit-form` folder.

I'm going to base the code off of the Airtable `curl` example which
looks like this:

```bash
curl -X POST https://api.airtable.com/v0/appXXXXXXXXXXXXXX/submissions \
  -H "Authorization: Bearer YOUR_SECRET_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
  "records": [
    {
      "fields": {
        "name": "Dave Davidson",
        "email": "medaveyo@iamhim.com",
        "message": "Yo yo yo!"
      }
    }
  ]
}'
```

Really, all I need from this is the shape of the data being submitted
which I'll put into a variable like this:

```ts
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
```

So in my endpoint I need to make a `POST` request to the Airtable API
using the `fetch` API. I'll need to add the `AIRTABLE_API_KEY` and
`AIRTABLE_BASE_ID` values from the `.env` file to the request headers
using the SvelteKit `$env` module and I'm going to want to return a
message if it fails or succeeds.

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

Ok, now I've got the endpoint set up I can test it out. I'll with the
event handler approach first.

## With an event handler

In the previous post I did this, I used an event handler to handle the
form submission. I'll use the same approach here.

The input names will need to match the field names in the Airtable
base. I'll add the `name` attribute to the input elements in the from
as well.

I'll create a `handle_submit` function that will be called when the
form is submitted. I'll use the `preventDefault` modifier to prevent
the default form submission behaviour and then I'll get the form data
and pass that onto the `submit-form` endpoint via `fetch` request.

```svelte
<script lang="ts">
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
  }
</script>

<h2>Event handler</h2>

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
```

The message response form the endpoint can them be used for some
conditional rendering of the form.

I'll create a `submission_status` variable and set it to the response
form the endpoint. Then I can use some Svelte if blocks to render
different content depending on the status.

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
    class="btn btn-primary w-full"
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
```

## With an action

Since the last post SvelteKit implemented 'actions'. Actions are a way
to add functionality to a component without having to add it to the
component itself. This is useful for things like analytics, logging,
and form submission.

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
<h2>Action</h2>

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
```

## SvelteKit Superforms

## Airtable automation

## Conclusion

You can check out the example code for this post over on GitHib
[sveltekit-and-airtable-contact-form-example]

<!-- Links -->

[previous post]:
  https://scottspence.com/posts/make-a-contact-form-with-sveltekit-and-airtable
[sign up for a free account]: https://airtable.com/signup
[Personal access token]: https://airtable.com/create/tokens
[sveltekit-and-airtable-contact-form-example]:
  https://github.com/spences10/sveltekit-and-airtable-contact-form-example
[zod]: https://zod.dev/

<!-- Images -->

[airtable-create-personal-access-token]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1683010912/airtable-create-personal-access-token.png
