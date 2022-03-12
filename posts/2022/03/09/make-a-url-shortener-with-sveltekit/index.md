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
This will redirect the `source` URL to the target or `destination`
URL.

An example could be the URL given to this project, say
`https://svort.li`. anything after the TLD (`.li`) will be the
`source` so `https://svort.li/me` will be redirected to the
`destination` URL for that source `https://scottspence.com`.

In the previous two projects I made there wasn't anything in the way
of a front-end framework as they were just configuration files to do
the redirects on the server.

This is still pretty much the same as it will be taking an incoming
request on the server (in the SvelteKit endpoint) and redirecting it.

## Setup the project

I'll scaffold out a skeleton SvelteKit using the following command:

```bash
npm init svelte@next svort-urls
```

I'll follow the prompts, I'll be yes to all the prompts there. Which
are.

```text
? Which Svelte app template? › - Use arrow-keys. Return to submit.
    SvelteKit demo app
❯   Skeleton project

✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

I'm not going to be covering browser testing in this post, but it's
nice to have the config there if you need it.😊

## Create the endpoint

In the `routes` folder I'll create a new `[slug].ts` file.

```bash
touch src/routes/'[slug]'.ts
```

The `[slug].ts` file is an endpoint, a HTTP endpoint in SvelteKit you
can use HTTP methods in endpoints. So, if I want to `GET` some data in
a route I can access it via these special SvelteKit files.

In this case I'm using a `GET` method so the `source` can be
redirected to the `destination`.

```ts
export const get = async () => {
  return {
    headers: { Location: '/' },
    status: 301,
  }
}
```

This will accept anything after root path (`/`) and redirect it at the
moment back to the homepage `/`.

So going to `localhost:3000/me` will redirect to `localhost:3000/`.

That is pretty much it!

For the list of links I'll be using a local config file, but you can
use something like a CMS or a database to control this.

## Acknowledgements

Thanks to Rainlife over on the Svelte Discord for suggesting the use
of `HEAD` (as I'm only interested in the header of the request). Also
thanks to Jordan (also on the Svelte Discord) for giving me this handy
MDN link for [Redirections in HTTP].

Also [Dana Woodman on Dev.to] for using redirects in SvelteKit
endpoints. I was using `redirect` instead of setting the headers.

<!-- Links -->

[redirections in http]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#permanent_redirections
[dana woodman on dev.to]:
  https://dev.to/danawoodman/how-to-redirect-in-sveltekit-endpoints-1im3
