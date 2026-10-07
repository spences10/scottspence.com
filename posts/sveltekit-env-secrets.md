---
date: 2021-06-22
title: SvelteKit .env secrets
tags: ['sveltekit', 'notes']
is_private: false
---

<script lang="ts">
  import { Banner } from '#lib/components/index.js'

  let href = `/posts/sveltekit-environment-variables-with-the-sveltekit-env-module`
  const options = {
    type: 'warning' as const,
    message: `SvelteKit now handles env secrets, take a look at <a href=${href} 
      target="_blank" rel="noopener noreferrer">SvelteKit Environment Variables 
      with the SvelteKit $env Module</a> which details how to use it in a 
      SvelteKit project.`
  }
</script>

<Banner {options} />

So SvelteKit is super awesome n' all and the best thing ever but have
you ever tried to use a `.env` secret that you didn't want exposed on
the client?

SvelteKit uses [Vite](https://vitejs.dev/) and it has a specific way to reference [Env
Variables and Modes](https://vitejs.dev/guide/env-and-mode.html#env-variables), you reference a `.env` variable with:

```js
import.meta.env.VITE_NAME_OF_VARIABLE;
```

The `VITE_*` prefix means in SvelteKit it makes that variable
available on the client.

## What if you have a secret key?

So if you want a secret key that's not exposed to the client then,
what? Remove the `VITE_*` prefix? Well, no, so, how to have secrets??

The answer is don't use Vite and instead use something to load the
variables from the `.env` file.

Use [env-cmd](https://www.npmjs.com/package/env-cmd) or [dotenv](https://www.npmjs.com/package/dotenv) or whatever you want to use to ensure the
runtime `process.env` is populated in dev.

## Example

Here I have defined my `.env` file at the root of my project:

<!-- cSpell:ignore wheeeeeeeee,shhhhhh -->

```python
VITE_CLIENT_VARIABLE=wheeeeeeeee
SUPER_SECRET_SECRET=shhhhhh
```

Then I've created a `secret.js` file to access my secret:

```js
export const API_URL = process.env['SUPER_SECRET_SECRET'];
```

Then I've added `env-cmd` to my `dev` script in my `package.json` so
that `process.env` has the super secret secret populated:

```json
"scripts": {
  "dev": "env-cmd svelte-kit dev",
```

Now I can access my super secret secret and have client side variables
too.

## Update

<!-- cSpell:ignore Hideckies -->

There's another option to use which I found on the [Blog by Hideckies](https://blog.hdks.org/Environment-Variables-in-SvelteKit-and-Vercel/)
in their example it's a `svelte.config.js` change:

```js
const config = {
	kit: {
		// ...
		vite: {
			define: {
				'process.env': process.env,
			},
		},
	},
};

export default config;
```

Check out the post linked earlier for more info!

## Thanks!

<!-- cSpell:ignore saikatdas0790 -->

A kind thank you to Discord users `Xyo` and especially `saikatdas0790`
on the Svelte Discord `svelte-kit` channel for helping me out with
this!
