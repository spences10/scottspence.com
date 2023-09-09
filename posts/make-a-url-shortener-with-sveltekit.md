---
date: 2022-03-09
updated: 2023-03-04
title: Make a URL Shortener with SvelteKit
tags: ['how-to', 'svelte', 'guide', 'airtable']
isPrivate: false
---

URL shorteners, use them for when you want to share an easy to
remember link. You _can_ use a service like Bitly or TinyURL or any of
the other ones out there already, or you could make it something you'd
want to use and have a bit more of a connection to it by making your
own!

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

## Add source and destination URLs

I'm going to add the source and destination URLs to a config file. In
SvelteKit the place for this would be in a `lib` folder.

```bash
# create the lib folder
mkdir src/lib
# create a file for the urls
touch src/lib/urls-list.ts
```

In the `urls-list.ts` file I'll add the source and destination URLs I
want, I'll add some example one here.

```ts
export const urls = [
  {
    source: '/me',
    destination: 'https://scottspence.com',
  },
  {
    source: '/twitter',
    destination: 'https://twitter.com/spences10',
  },
  {
    source: '/git',
    destination: 'https://github.com/spences10',
  },
]
```

## Redirect to the destination URL

With my list of short links in place, I can use them in the
`[slug].ts` endpoint. so going to `localhost:3000/me` I will now want
redirect to `https://scottspence.com`.

I'll need a way to know what the source URL is in the endpoint so I
can destructure that out of the context passed to the endpoint.

Let's take a quick look at what we get in the `context` (or `ctx`)
object.

```ts
export const get = async ctx => {
  console.log(ctx)
  return {
    headers: { Location: '/' },
    status: 301,
  }
}
```

So now if I navigate to `localhost:3000/something` I'll see the
following output in the terminal:

```json
{
  request: Request {
    size: 0,
    follow: 20,
    compress: true,
    counter: 0,
    agent: undefined,
    highWaterMark: 16384,
    insecureHTTPParser: false,
    [Symbol(Body internals)]: {
      body: null,
      stream: null,
      boundary: null,
      disturbed: false,
      error: null
    },
    [Symbol(Request internals)]: {
      method: 'GET',
      redirect: 'follow',
      headers: [Object],
      parsedURL: [URL],
      signal: null,
      referrer: undefined,
      referrerPolicy: ''
    }
  },
  url: URL {
    href: 'http://localhost:3000/something',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    username: '',
    password: '',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/something',
    search: '',
    searchParams: URLSearchParams {},
    hash: ''
  },
  params: { slug: 'something' },
  locals: {},
  platform: undefined
}
```

So what I'm interested in here is the `url` object, more specifically
the `url.pathname`. This is going to help me identify where I want the
request to be redirected to.

```json
url: URL {
  href: 'http://localhost:3000/something',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/something',
  search: '',
  searchParams: URLSearchParams {},
  hash: ''
}
```

I could also use `params.slug` object for this as well.

```json
params: { slug: 'something' },
```

In this example I'll be using the `url` object. So I'll destructure
the `url` object out of the context object and import the `urls-list`
file.

```ts
import { urls } from '$lib/urls-list'

export const get = async ({ url }) => {
  return {
    headers: { Location: '/' },
    status: 301,
  }
}
```

Then I can get a redirect out of the `urls` array. I'll declare this
this as a `[redirect]` variable.

So I'll see what I get if I log out the contents of `[redirect]` now,
I'm going to want to filter for anything that matches the
`url.pathname` from `urls-list` file, so for now I'll `console.log`
out the results:

```ts
import { urls } from '$lib/urls-list'

export const get = async ({ url }) => {
  const [redirect] = urls.filter(item => {
    console.log(item)
  })

  return {
    headers: { Location: '/' },
    status: 301,
  }
}
```

Now if I navigate to `localhost:3000/something` I'll see the following
in the terminal:

```json
{ source: '/me', destination: 'https://scottspence.com' }
{ source: '/twitter', destination: 'https://twitter.com/spences10' }
{ source: '/git', destination: 'https://github.com/spences10' }
```

Sweet! So now I can use some logic to determine if the `url.pathname`
matches what's in the `urls` array.

So, with the `item` I'm using in the filter I can compare against the
`url.pathname`. If there's a valid match I can get the `destination`
from the `urls` array.

```ts
import { urls } from '$lib/urls-list'

export const get = async ({ url }) => {
  const [redirect] = urls.filter(item => item.source === url.pathname)

  if (redirect) {
    return {
      headers: { Location: redirect.destination },
      status: 301,
    }
  } else if (!redirect && url.pathname.length > 1) {
    return {
      headers: { Location: '/' },
      status: 301,
    }
  } else return {}
}
```

I can use an `if` to check for a valid match. If there's a valid match
then set the `headers.Location` to the `destination` from the `urls`
array.

If it doesn't match I'll redirect to the homepage (`/`) and have a
final catch to return an empty object.

## Conclusion

That's it! I've created a simple redirect in SvelteKit that will take
an incoming URL and redirect to a destination URL.

I can now use the homepage as a landing page for my short URLs so
anyone coming to the site can check out any of the available links.

## Further exploration

This has been a bit of an eye opener for me so I think I'm going to
experiment with using something in the way of a backend. Undecided yet
but I could make this something for users and not just a personal
project for me. This would involve authentication and something to
store the user data i.e. a CMS (more than likely GraphCMS) or a
database of some sort, I've not checked out planet scale yet so could
take a look at that.

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
