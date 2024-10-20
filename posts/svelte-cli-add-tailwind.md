---
date: 2024-10-20
title: The new Svelte (sv) CLI, adding Tailwind is simple now
tags: ['tailwind', 'svelte', 'how-to']
isPrivate: false
---

Aight! With Svelte Summit Fall 2024 done with we got a load of cool
new announcements, Svelte 5 being the big one along with the new site
and docs! Beautiful!

One of the other big announcements was the new Svelte CLI
[`sv`](https://www.npmjs.com/package/sv) which combines `svelte-add`
with the `create svelte` command.

So, now rather than searching around for
[How to Set Up Svelte with Tailwind CSS](https://scottspence.com/posts/how-to-set-up-svelte-with-tailwind)
it's a couple of commands!

It can be installed as a global dependency or just run with `npx`.

To scaffold out a new project, I can use the `sv` CLI and give it a
name:

```bash
npx sv@latest create my-awesome-project
```

Then I can add all the things! Check out the options!

```bash
npx sv@latest create my-awesome-project
┌  Welcome to the Svelte CLI! (v0.5.7)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with Typescript?
│  Yes, using Typescript syntax
│
◆  Project created
│
◆  What would you like to add to your project?
│  ◻ prettier (https://prettier.io)
│  ◻ eslint
│  ◻ vitest
│  ◻ playwright
│  ◻ tailwindcss
│  ◻ drizzle
│  ◻ lucia
│  ◻ mdsvex
│  ◻ paraglide
│  ◻ storybook
└
```

So I can go select ALL them things!

But I'll just go with the defaults I always pick so that I can go over
the other command:

```bash
npx sv@latest create my-awesome-project
┌  Welcome to the Svelte CLI! (v0.5.7)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with Typescript?
│  Yes, using Typescript syntax
│
◆  Project created
│
◆  What would you like to add to your project?
│  ◼ prettier
│  ◼ eslint
│  ◼ vitest
│  ◼ playwright (https://playwright.dev)
│  ◻ tailwindcss
│  ◻ drizzle
│  ◻ lucia
│  ◻ mdsvex
│  ◻ paraglide
│  ◻ storybook
└
```

That'll create my project, and the thing is, most of the use cases
here will be people that already have a project and want to add
Tailwind.

Now I've already got the project created, so I can just add Tailwind
with the `add` command:

```bash
npx sv@latest add tailwind
┌  Welcome to the Svelte CLI! (v0.5.7)
│
◆  Which plugins would you like to add?
│  ◻ typography (@tailwindcss/typography)
│  ◻ forms
│  ◻ container-queries
│  ◻ aspect-ratio
└
```

Notice that I used the `tailwind` keyword in the command, this will
prompt for additional plugins to configure with it!

Alternatively, I can just run `npx sv@latest add` and then select
Tailwind from the list along with anything else I'd like to configure!

Super neat!

It's early days for the new CLI and I have found an issue configuring
MDSveX but it's only going to get better from here with the prospect
of community additions on the roadmap!
