---
date: 2021-09-20
title: SvelteKit Crash Course
tags: ['svelte', 'sveltekit']
isPrivate: true
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Okedokey! In this crash course I'll be detailing loads of SvelteKit
features and how you can use them in a project.

If you prefer to see this in a video you can [Tl;Dr] to the video
section.

## What I'm going to Build

Ok so let's take a look at what I'm going to build!

<!-- cSpell:ignore Pokedex -->

A Pokedex!

No, a blog!

A blog is up there with making project with a Pokedex but with the
blog you can add to it over time if you're going to use it for your
own blog.

This doesn't have to be a blog however! What I'll be detailing here
can be applied for any project that will be getting data from a
GraphQL API!

There are a few prerequisites you'll need if you're following along.
These are:

- Node v14+
- Terminal
- VS Code or a text editor of your choosing
- GitHub/GitLab account

Or Gitpod ot GitHub code spaces.

## What is Svelte and SvelteKit

SvelteKit is a frontend framework much like Vue and React but unlike
Vue and React SvelteKit it has no virtual DOM and instead compiles
down to HTML, CSS and JavaScript.

SvelteKit will soon be the one stop shop for anything being build with
Svelte as it will support Server Side Rendering, Client Side Rendering
and static site generation.

You can think of SvelteKit much in the same as NextJS which will
become clear once we get into the routing side of things with
SvelteKit.

Ok, let's set up the project!

## GraphCMS init

I'll be using a GraphCMS starter for the backend data, I'm going to
log in and select the Blog starter template.

I'll give the project a really serious name, Sparkles Blog!

Now that's finished we can take a quick look around the GraphCMS
project.

## SvelteKit init

Ok, so I'm going to create the project with `npm init`, Svelte @next,
the @next is because SvelteKit is still in public beta.

I'm using the following terminal command:

```bash
npm init svelte@next sparkles-blog
```

`sparkles-blog` is the name of the folder the CLI will create the
project in.

```bash
cd sparkles-blog
# install dependencies
npm i
```

Init a git repo for when I want to publish it to the web using Vercel
and also so I can highlight changes as they happen:

```bash
git init
```

I'be styling this as I go along with Tailwind and DaisyUI, I'll setup
Tailwind first using Svelte Add to configure Tailwind in the SvelteKit
project!

https://github.com/svelte-add/svelte-add

```bash
npx svelte-add@latest tailwindcss
```

Svelte Add for Tailwind has Just In Time mode enables by default, you
can check out more about that over on the Tailwind website.

https://tailwindcss.com/docs/just-in-time-mode

## Tour of the project

First up let's take a look at the `package.json` and change the
project name!

SvelteKit uses the Vite build tool, insanely fast! This was the main
reason I switched my own site over to SvelteKit from Gatsby when I saw
how quickly this updated.

Let's talk about Vite environment variables quickly:
https://vitejs.dev/config/#envprefix

Because I'll be using environment variables in the endpoints this
shouldn't be an issue but to avoid any confusion and possible exposure
of sensitive API keys I think it's best to go with a solution like
`env-cmd`: https://www.npmjs.com/package/env-cmd

Add additional packages for use in the endpoints I'll be creating to
query data from a GraphQL API! Also adding in DaisyUI for rapid
creating of components.

```bash
npm i -D graphql-request graphql env-cmd daisyui @tailwindcss/typography
```

I'll add the DaisyUI plugin to the Tailwind config along file along
with the Tailwind typography plugin:

```js
plugins: [
  require('@tailwindcss/typography'),
  require('daisyui'),
],
```

Then I'll also need to configure `env-cmd` to add the environment
variables for use in the dev server.

## Complete video

<YouTube youTubeId="zH2qG9YwN3s" />

## Setup GraphQL client

## Setup API Endpoints

## svelte:head

## Svelte Layout File

## (SSR) Pages for each post

## Svelte Animations

<!-- Links -->

[tl;dr]: #complete-video
