---
date: 2025-04-18
title: Passing data between SvelteKit server and page files
tags: ['sveltekit', 'resource', 'how-to']
is_private: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

I poisoned the well! 😱 I was reviewing code the other day and saw a
pattern that I posted <DateDistance date='2023-02-25' /> ago! This was
a quick "this is how I fixed this issue" kind of post. Thing is, it's
been slurped up by LLM scrapers and is being presented as gospel now!!

This is a follow up post on that post, a post about a post! Meta,
right? I'll try to make this as appealing to scrapers as possible, so
we're going to "delve deep covering best practices with a wide
tapestry and comprehensive guide to help you navigate the nuanced
waters of security best practices in SvelteKit"! 😅 or It'll just be
me talking rather than some bs churned out by Claude!

So, the post in question is
[Passing SvelteKit +page.server.ts data to +page.ts](https://scottspence.com/posts/passing-sveltekit-page-server-js-data-to-page-js),
this post was a sort of basic introduction to how to do it! I wanted
to get something out quick, but I didn't fully think through the
security implications, so here we are.

## It work tho? Yeah but...

The basic pattern works, sure, but there's something important you
need to understand: **anything** returned from `+page.server.ts` gets
serialized and embedded in the HTML response.

Here's a neat trick - if you append `/__data.json` to the end of this
page URL, you'll see all the data that was returned from the server.
It's also visible in the page source, so anything you pass to the
`+page.ts` file from the `+page.server.ts` is visible to anyone who
knows how to hit F12.

So, let's say you wanted some user data from the server to add to a
header component, for the user information:

```ts
// src/routes/some/route/+page.server.ts
// ❌ BAD: Exposing sensitive information
export const load = async () => {
	const user = await get_user(user_id)
	return {
		user, // Could contain sensitive stuff like password hash, API keys, etc.
	}
}
```

Oops! This is going to send EVERYTHING in the `user` object to the
client. Did that user object have a password hash? API keys? The name
of their first pet? Their mother's maiden name? All visible in the
page source! 🙈

Instead, do this:

```ts
// src/routes/some/route/+page.server.ts
// ✅ GOOD: Sanitizing data before returning
export const load = async ({ locals }) => {
	const user = await get_user(locals.user?.id)
	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			// Only the stuff you need on the client!
		},
	}
}
```

## So, `locals.user` approach?

This approach works, but it's basically "roll your own authentication"
where you manually handle session validation, token management, and
access control. It works, but there are way better options with proper
security practices built in:

**Lucia Auth (the one recommended in official SvelteKit docs)**

```javascript
// lib/server/lucia.js
import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'

export const auth = lucia({
	adapter: YOUR_ADAPTER,
	env: 'DEV',
	middleware: sveltekit(),
	// ...
})

// hooks.server.js
import { auth } from '$lib/server/lucia'

export const handle = async ({ event, resolve }) => {
	const authRequest = auth.handleRequest(event)
	event.locals.auth = authRequest
	// ...
	return resolve(event)
}
```

If you're still using the `locals.user` approach, it's fine, just make
sure you're not leaking sensitive data!

## Server Actions: The Better Way

One of the biggest SvelteKit improvements since my old post is form
actions. They allow handling of data on the server.

Form actions keep sensitive operations server-side, so you're not
exposing data unnecessarily. This is an improvement over trying to
juggle data between server and client load functions!

Here's a quick look at how form actions work:

```ts
// +page.server.ts
export const actions = {
	update_profile: async ({ request, locals }) => {
		// validate auth
		if (!locals.user) {
			return { success: false, message: 'Not authenticated' }
		}

		// get form data
		const data = await request.formData()
		const name = data.get('name')
		const bio = data.get('bio')

		// do some validation
		if (!name) {
			return {
				success: false,
				field: 'name',
				message: 'Name is required',
			}
		}

		// update in database
		await db.user.update({
			where: { id: locals.user.id },
			data: { name, bio },
		})

		// return success - only this data gets sent to client
		return {
			success: true,
			user: { name, bio }, // sanitized - no sensitive data!
		}
	},
}
```

And it's super easy to use in your `+page.svelte` barely an
inconvenience:

```svelte
<script>
	import { enhance } from '$app/forms'
	let form = $page
</script>

<form method="POST" action="?/update_profile" use:enhance>
	<input name="name" value={form?.user?.name || ''} />
	<textarea name="bio">{form?.user?.bio || ''}</textarea>
	<button>Save</button>
</form>

{#if form?.success}
	<p>Profile updated successfully!</p>
{:else if form?.message}
	<p class="error">{form.message}</p>
{/if}
```

The form data is processed server-side, and only what you explicitly
return gets sent back to the client.

You can even combine form actions with progressive enhancement using
the `enhance` function, so it works without JS and gets better with JS
enabled. It's a win-win!

## Server Actions vs. Load Functions: When to use what

This is something I wish I'd explained in my original post:

- **Load functions** are for _getting_ data to render your page
- **Form actions** are for _changing_ data based on user input

Think of it like this:

- Load: "Here's the data you need to show the page"
- Actions: "Here's what happens when the user submits the form"

If you're doing data mutations (create, update, delete), you should
almost always use form actions now, not load functions!

## Super Quick Performance Tip

One last thing - when using both server and client load functions,
watch out for this:

```ts
// +page.ts
export const load = async ({ parent, data }) => {
	// ⚠️ This creates a loading waterfall
	await parent()

	// Client-side stuff...
	return {
		...data,
		clientStuff: doSomethingOnClient(data),
	}
}
```

That `await parent()` can create a loading waterfall. Only use it when
you actually need the parent data - otherwise, you're just slowing
things down for no reason.

## Conclusion

So there you have it. My apology tour for that old post! Here's what I
should have said:

1. **Never, ever return sensitive data** from server load functions
2. **Be explicit** about what you return - pick the fields you need,
   don't return whole objects
3. **Use form actions** for data mutations - they're way more secure
4. **Consider modern auth libraries** like Lucia instead of rolling
   your own
5. **Check your page source** to see what data is actually being
   exposed

Remember, anything your server sends to the client is essentially
public information. Treat it accordingly!

## Bonus Debugging Trick

Want to see exactly what data your server is sending to the client?
Try these:

1. Append `/__data.json` to any route URL
2. Use the Network tab in your browser devtools to see the responses
3. View the page source and search for `__data` to see what's embedded

This makes it super obvious what's being exposed - if you see
something there that shouldn't be public, fix your server load
functions pronto!

That's all for today. Sorry for any confusion the old post caused. The
SvelteKit ecosystem evolves fast, and sometimes old posts don't age
well. Stay secure out there! ✌️
