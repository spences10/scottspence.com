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

## With an event handler

## With an action

## Airtable automation

<!-- Links -->

[previous post]:
  https://scottspence.com/posts/make-a-contact-form-with-sveltekit-and-airtable
[sign up for a free account]: https://airtable.com/signup
