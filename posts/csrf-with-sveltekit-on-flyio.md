---
date: 2024-04-02
title: CSRF with SvelteKit on Fly.io
tags: ['flyio', 'sveltekit', 'docker', 'notes']
isPrivate: false
---

Aight! I've spent the weekend working out the migration of this site
from Vercel over to Fly.io. I'm still not 100% there but think I've
covered most of it now, one thing that took up a lot of my time doing
this is trying to work out why a from using a `POST` method would give
a `403` on Fly.io but would work fine on Vercel. This was due to the
Cross-Site Request Forgery (CSRF) protection that SvelteKit has built
in.

I'm presuming this is to do with the way Fly.io differs to Vercel in
how headers are used to identify the origin of the request.

This is essentially a follow on post from the
[Deploying SvelteKit Apps on Fly.io](https://scottspence.com/posts/deploying-sveltekit-apps-on-fly-io)
post and the next set of hurdles you'll come up against if you're
doing something similar.

One thing to note is that I got tired of all the node build errors I
was getting on Fly.io with this app, (mostly due to CJS/ESM
compatibility) so, I switched to Bun, which side-stepped all of that.

So, I have an app (this site) building on Fly.io now, got the
deployment workflow working nicely, but, as mentioned trying to use
any of the forms on the site would throw a `403` error.

After some searching and reading I found a solution, which I'll
document here for future reference.

So, list time, these are all on the SvelteKit GitHub repo:

- I found this issue: https://github.com/sveltejs/kit/issues/6589
- specifically this comment:
  https://github.com/sveltejs/kit/issues/6589#issuecomment-1984314643
- which in turn pointed to this issue:
  https://github.com/sveltejs/kit/issues/6784
- and this comment:
  https://github.com/sveltejs/kit/issues/6784#issuecomment-1416104897

Essentially, disable the CSRF protection in the `svelte.config.js`
file:

```js
csrf: {
  checkOrigin: false,
},
```

So, now it's party time for CSRF attacks, right?

I've then added the suggested middleware to the `src/hooks.server.ts`
file detailed in the GitHub issue:

```ts
import { themes } from '$lib/themes'
import { error, json, text, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const csrf_config = {
	allowed_paths: ['/api/reactions', '/api/submit-email', '/contact'],
}

type ErrorResponse = {
	status: number
	body: {
		message: string
	}
}

const csrf =
	(allowed_paths: string[]): Handle =>
	async ({ event, resolve }) => {
		const forbidden =
			['POST', 'PUT', 'PATCH', 'DELETE'].includes(
				event.request.method,
			) &&
			event.request.headers.get('origin') !== event.url.origin &&
			is_form_content_type(event.request) &&
			!allowed_paths.includes(event.url.pathname)

		if (forbidden) {
			const csrf_error = error(
				403,
				`Cross-site ${event.request.method} form submissions are forbidden`,
			)
			if (
				event.request.headers.get('accept') === 'application/json'
			) {
				return json(csrf_error.body, { status: csrf_error.status })
			}
			return text(csrf_error.body.message, {
				status: csrf_error.status,
			})
		}

		return resolve(event)
	}

const is_content_type = (request: Request, ...types: string[]) => {
	const type =
		request.headers.get('content-type')?.split(';', 1)[0].trim() ?? ''
	return types.includes(type)
}

const is_form_content_type = (request: Request) => {
	return is_content_type(
		request,
		'application/x-www-form-urlencoded',
		'multipart/form-data',
	)
}

const theme: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('theme')

	if (!theme || !themes.includes(theme)) {
		return await resolve(event)
	}

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('data-theme=""', `data-theme="${theme}"`)
		},
	})
}

export const handle = sequence(csrf(csrf_config.allowed_paths), theme)
```

So now any request made to the server that is a `POST`, `PUT`, `PATCH`
or `DELETE` request will be checked against the `allowed_paths` array
and if the request is not from the same origin as the server then a
`403` will be returned.

I've not had to do anything like this before, so, it's been a good
learning experience, and I'm glad I've got it working now.
