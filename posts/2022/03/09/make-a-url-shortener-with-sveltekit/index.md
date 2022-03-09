---
date: 2022-03-09
title: Make a URL Shortener with SvelteKit
tags: ['how-to', 'svelte', 'guide']
isPrivate: true
---

URL shorteners, use them for when you want to share an easy to
remember link. You _can_ use a service like Bitly or TinyURL or any of
the other ones out there already, or you could make it something you'd
want to use and have a bit more of a connection to by making your own!

In the past I've made a personal URL shorteners with a Netlify
`_redirects` file and with a Vercel `vercel.json` file. In this post
I'm going to make a URL shortener with SvelteKit.

I will use a SvelteKit endpoint to redirect the requests made to it.
In the previous two projects I made there wasn't anything in the way
of a front-end framework as they were just configuration files to do
the redirects on the server.

This is still pretty much the same as the Vercel project, I've
actually just ripped out the `now.json` file from the project and I'm
using it in the Svelte one!

## Setup the project

I'll scaffold out a skeleton SvelteKit using the following command:

```bash
npm init svelte@next svort-urls
```

I'll follow the prompts, I'll be yes to all the prompts there. Which
are.

```text
✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

## Create the endpoint

In the `routes` folder create a new `[slug].ts` file.

```bash
touch src/routes/[slug].ts
```

The `[slug].ts` file is an endpoint, in SvelteKit you can use HTTP
methods in endpoints. In this case I'm using a GET method.

```ts
export const get = async ({ url }) => {
  return {
    headers: { Location: '/' },
    status: 301,
  }
}
```

Thanks to Rainlife over on the Svelte Discord for suggesting the use
of `HEAD` (as I'm only interested in the header of the request). Also
thanks to Jordan (also on the Svelte Discord) for giving me this handy
MDN link for [Redirections in HTTP].

<!-- Links -->

[redirections in http]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#permanent_redirections
