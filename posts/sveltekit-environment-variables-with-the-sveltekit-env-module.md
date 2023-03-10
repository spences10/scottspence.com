---
date: 2022-08-07
updated: 2023-02-05
title: SvelteKit Environment Variables with the SvelteKit $env Module
tags: ['sveltekit', 'notes']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
</script>

With SvelteKit in the past if you wanted to use a `.env` file secret
that you didn't want exposed on the client there was some additional
config you needed to do.

Vite exposes all variables contained in the `.env` file prefixed with
`VITE_` to the client. If you wanted to use an environment variable
with Vite you _could_ expose it using:

```js
import.meta.env.VITE_NAME_OF_VARIABLE
```

This isn't great if you have a secret key that you don't want exposed
on the client though.

The additional config was to use something like [`env-cmd`] to load
your environment variables. I made a post about this in the past in
[SvelteKit .env secrets] but this isn't necessary now!

SvelteKit now has a `$env` module that you can use to access public
and private `.env` file variables.

It was [Geoff Rich] (Svelte maintainer) that brought this to my
attention with a tweet:

<Tweet tweetLink="geoffrich_/status/1553035835351543808" />

I had a play around with getting them set up on this site, you can see
the Git diff on the [PR here] for more detail or read on.

There are two parts to the SvelteKit `$env` module for static and
dynamic variables, this means that the variable is either sent from
the server or a static variable taken from the `.env` file:

In practice this means that you are guided by SvelteKit on what
environment variables you can use. So, trying to import a private
variable from either `$env/static/private` or `$env/dynamic/private`
will result in an error.

Accessing any data that needs a private variable will need to be done
on the server.

Example, using a public variable in a `.svelte` file:

```svelte
<script>
  import { env } from '$env/static/public'
</script>

{env.PUBLIC_VARIABLE}
```

In a `.js` file (endpoint):

```js
import { env as private_env } from '$env/static/private'
import { env as public_env } from '$env/static/public'

export const GET = async () => {
  console.log('=====================')
  console.log(private_env.SECRET_VARIABLE)
  console.log(public_env.PUBLIC_VARIABLE)
  console.log('=====================')
  return {}
}
```

There's an example repository over on GitHub that you can take a look
at here: https://github.com/spences10/sveltekit-env-example

Check out the documentation for each implementation:

- https://kit.svelte.dev/docs/modules#$env-dynamic-private
- https://kit.svelte.dev/docs/modules#$env-dynamic-public
- https://kit.svelte.dev/docs/modules#$env-static-private
- https://kit.svelte.dev/docs/modules#$env-static-public

<!-- Links -->

[`env-cmd`]: https://www.npmjs.com/package/env-cmd
[sveltekit .env secrets]:
  https://scottspence.com/posts/sveltekit-env-secrets
[geoff rich]: https://twitter.com/geoffrich_
[pr here]: https://github.com/spences10/scottspence.com/pull/323/files
