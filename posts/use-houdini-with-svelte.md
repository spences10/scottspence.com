---
date: 2022-01-15
title: Use Houdini with Svelte
tags: ['sveltekit', 'how-to', 'graphql', 'graphcms']
isPrivate: true
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Houdini! The disappearing GraphQL client! I've used Houdini for a
couple of projects now and I think it's great!

I first came across this post from the creator of Houdini ([Alec
Aivazis]) over on Dev.to for [Building an Application with GraphQL and
SvelteKit]. A great post on getting set up with Houdini using the [The
Rick
and Morty API].

You can see the [example I made] following along over on GitHub and
the [example site] deployed to Vercel.

Alec's example although a great start didn't cover some parts of using
the client I was wanting to do with the Rick and Morty example like
passing variables to queries on routes which I worked out in the
example I made.

In this how to, I'll be making the standard blog example using the
GraphCMS blog starter! If you just want to check out the code you can
find the [blog example using Houdini] over on GitHub.

I'll be creating the backend for the project with the GraphCMS blog
template, check out the video here on how to get started with that!

<!-- cSpell:ignore CUudpo8n2FA -->

<YouTube youTubeId='CUudpo8n2FA'/>

I'll be using [pnpm] for my package management, you can do what you
please with your preferred package manager. (pnpm, npm or yarn)

```bash
# create new svelte project named houdini-with-sveltekit-and-graphcms
pnpm init svelte@next houdini-with-sveltekit-and-graphcms
```

The CLI will prompt for some options, here's what I've picked:

```bash
Which Svelte app template? › Skeleton project
Use TypeScript? › No
Add ESLint for code linting? › No
Add Prettier for code formatting? › Yes
```

Once it's finished I can change directory into the project and install
the dependencies.

```bash
# change directory into the newly created project
cd houdini-with-sveltekit-and-graphcms
# install dependencies
pnpm install
# optional init git repo
git init && git add -A && git commit -m "Initial commit"
```

Install the Houdini dependencies

```bash
pnpm i -D houdini houdini-preprocess
```

Initialise Houdini

```bash
npx houdini init
```

I'll be prompted for the GraphCMS project GraphQL API here, you can
check out the video here for how to get that:

<!-- cSpell:ignore ID8bchiyNfw -->

<YouTube youTubeId='ID8bchiyNfw'/>

## Add Houdini to `svelte.config.js`

I'll need to add the Houdini preprocess to the `svelte.config.js`

```js
import adapter from '@sveltejs/adapter-auto'
import houdini from 'houdini-preprocess'
import path from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [houdini()],
	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: {
			resolve: {
				alias: {
					$houdini: path.resolve('.', '$houdini'),
				},
			},
			server: {
				fs: {
					// Allow serving files from one level up to the project root
					// https://vitejs.dev/config/#server-fs-allow
					allow: ['..'],
				},
			},
		},
	},
}

export default config
```

Add the Houdini client to the `__layout.svelte` file

```bash
touch src/routes/__layout.svelte
```

```svelte
<script context="module">
	import { setEnvironment } from '$houdini'
	import environment from '../environment'

	setEnvironment(environment)
</script>

<slot />
```

## Show GraphQL endpoint data in the browser

```svelte
<script>
	import { graphql, query } from '$houdini'
	const { data } = query(graphql`
		query AllPosts {
			posts {
				title
				slug
				date
				excerpt
				tags
				coverImage {
					url(
						transformation: {
							image: {
								resize: { width: 400, height: 400, fit: clip }
							}
						}
					)
				}
			}
		}
	`)
	const { posts } = $data
</script>

<pre>{JSON.stringify(posts, null, 2)}</pre>
```

```bash
npx houdini generate
```

```bash
npx houdini generate
AllPosts
Error: Could not convert scalar type: Date
```

Edit the Houdini config file with the custom scalar

```js
/** @type {import('houdini').ConfigFile} */

const config = {
	schemaPath: './schema.graphql',
	sourceGlob: 'src/**/*.svelte',
	module: 'esm',
	framework: 'kit',
	scalars: {
		// the name of the scalar we are configuring
		Date: {
			// the corresponding typescript type (what the typedef generator leaves behind in the response and operation inputs)
			type: 'Date',
			// turn the api's response into that type
			unmarshal(val) {
				const date = new Date(val).toISOString()
				return date
			},
			// turn the value into something the API can use
			marshal(date) {
				return date.getTime()
			},
		},
	},
}

export default config
```

<!-- cSpell:ignore unmarshal -->

Run Houdini generate again

```bash
npx houdini generate
AllPosts
```

Add Houdini generate command to the `package.json` scripts

```json
"scripts": {
  "dev": "npx houdini generate && svelte-kit dev",
  "build": "npx houdini generate && svelte-kit build",
  "package": "svelte-kit package",
  "preview": "npx houdini generate && svelte-kit preview",
  "lint": "prettier --ignore-path .gitignore --check --plugin-search-dir=. .",
  "format": "prettier --ignore-path .gitignore --write --plugin-search-dir=. ."
},
```

## Add index page markup

<!-- Links -->

[alec aivazis]: https://github.com/AlecAivazis
[building an application with graphql and sveltekit]:
	https://dev.to/alecaivazis/building-an-application-with-graphql-and-sveltekit-3heb
[the rick and morty api]: https://github.com/afuh/rick-and-morty-api
[short post on it here]: https://afuh.dev/the-rick-and-morty-api
[example i made]:
	https://github.com/spences10/houdini-with-svelte-example
[example site]: https://houdini-with-svelte-example.vercel.app/
[blog example using houdini]:
	https://github.com/spences10/houdini-with-sveltekit-and-graphcms
[pnpm]: https://pnpm.io/
