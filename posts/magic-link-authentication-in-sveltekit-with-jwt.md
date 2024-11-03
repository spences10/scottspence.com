---
date: 2024-09-28
title:
  Building a Secure Magic Link Authentication Flow in Sveltekit with
  JWT
tags: ['sveltekit', 'jwt', 'authentication', 'security']
isPrivate: true
---

I recently implemented a magic link flow for a work project and
thought I'd document the process. The requirements were, display the
content to the user if they were on an approved list of email
addresses. It was a one page project so rather than set up a whole
auth system I used a magic link flow which would send the login link
to the user if they were on an approved list of users.

Outside of the typical dependencies that come with a SvelteKit project
I'll use `jsonwebtoken` for the JWT implementation and `nodemailer` to
send the email.

## Why JWT?

JSON Web Tokens (JWT) are perfect for this use case because:

1. They can be securely signed to prevent tampering
1. They can include expiration times for added security

Let's break down how I'll implement this.

## The Authentication Flow

1. User enters email on login page
1. Server generates a JWT containing the user's email and an
   expiration time
1. Server sends an email with a magic link containing this JWT
1. User clicks the link, which includes the JWT as a query parameter
1. Server verifies the JWT's signature and expiration
1. If valid, server sets a secure HTTP-only cookie with a new session
   JWT
1. User is redirected to the protected content

Now, I'll implement this step-by-step!

## Set up the project

First, create a new SvelteKit project and install the necessary
dependencies:

```bash
pnpm create svelte@latest secure-magic-link-auth
```

Here's the options I always pick from the CLI, you can pick what you
like:

```text
┌  Welcome to SvelteKit!
│
◆  Which Svelte app template?
│  ● Skeleton project (Barebones scaffolding for your new SvelteKit app)
│
◆  Add type checking with TypeScript?
│  ● Yes, using TypeScript syntax
│
◆  Select additional options (use arrow keys/space bar)
│  ◼ Add ESLint for code linting
│  ◼ Add Prettier for code formatting
│  ◼ Add Playwright for browser testing
│  ◼ Add Vitest for unit testing
│  ◼ Try the Svelte 5 preview (unstable!)
│
└  Your project is ready!
```

Yeah! Svelte 5! Not that there's going to be much Svelte 5 going on
here!

```bash
cd secure-magic-link-auth
pnpm i # install dependencies
pnpm i -D jsonwebtoken @types/jsonwebtoken nodemailer @types/nodemailer
```

Aight, [make pretty look good](#make-pretty-look-good) later, I'll
just move on with the implementation.

## Setup environment variables

```bash
touch .env
```

I'll add in the following environment variables:

```text
JWT_SECRET=your_jwt_secret_here
APPROVED_EMAILS=email1@example.com,email2@example.com
EMAIL_HOST=smtp.fastmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@fastmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM="Your App" <noreply@example.com>
```

## Set up auth lib

```bash
touch src/lib/auth.ts
```

```ts
// src/lib/auth.ts
import {
	APPROVED_EMAILS,
	EMAIL_FROM,
	EMAIL_HOST,
	EMAIL_PASS,
	EMAIL_PORT,
	EMAIL_SECURE,
	EMAIL_USER,
	JWT_SECRET,
} from '$env/static/private'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const approved_emails = APPROVED_EMAILS.split(',')

export const is_approved_email = (email: string): boolean => {
	return approved_emails.includes(email.toLowerCase())
}

export const generate_magic_link = async (
	email: string,
	base_url: URL,
): Promise<string> => {
	const expires_in = 3600 // 1 hour
	const payload = {
		email,
		exp: Math.floor(Date.now() / 1000) + expires_in,
	}
	const token = jwt.sign(payload, JWT_SECRET)
	return `${base_url.origin}/auth/${token}`
}

export const send_magic_link_email = async (
	email: string,
	magic_link: string,
) => {
	console.log('Sending magic link email')
	const transporter = nodemailer.createTransport({
		host: EMAIL_HOST,
		port: parseInt(EMAIL_PORT),
		secure: EMAIL_SECURE === 'true',
		auth: {
			user: EMAIL_USER,
			pass: EMAIL_PASS,
		},
	})

	try {
		await transporter.sendMail({
			from: EMAIL_FROM,
			to: email,
			subject: 'Your Magic Link',
			html: `
        <h1>Welcome to Your App</h1>
        <p>Click the link below to access your account:</p>
        <a href="${magic_link}">Access Your Account</a>
        <p>This link will expire in 1 hour.</p>
      `,
		})
		console.log('Email sent successfully')
	} catch (error) {
		console.error('Error sending email:', error)
		throw error // Re-throw the error so it's caught in the action
	}
}

export const verify_magic_link = (token: string): string | null => {
	try {
		const payload = jwt.verify(token, JWT_SECRET) as { email: string }
		return payload.email
	} catch (error) {
		return null
	}
}
```

## Auth route

```bash
mkdir -p src/routes/auth/'[token]'
touch src/routes/auth/'[token]'/+server.ts
```

```ts
// src/routes/auth/[token]/+server.ts
import { verify_magic_link } from '$lib/auth'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	const { token } = params
	const email = verify_magic_link(token)

	if (email) {
		const session_data = {
			email,
			expires: Date.now() + 60 * 60 * 1000, // 1 hour from now
		}

		const session_cookie = `session=${JSON.stringify(session_data)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`

		return new Response(null, {
			status: 302,
			headers: {
				'Set-Cookie': session_cookie,
				Refresh: '0; url=/',
			},
		})
	} else {
		redirect(302, '/login?error=invalid_token')
	}
}
```

## Login page

```bash
mkdir src/routes/login
touch src/routes/login/+page.server.ts
touch src/routes/login/+page.svelte
```

```ts
// src/routes/login/+page.server.ts
import {
	generate_magic_link,
	is_approved_email,
	send_magic_link_email,
} from '$lib/auth'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ request, url }) => {
		console.log('Login action started')
		const data = await request.formData()
		const email = data.get('email')

		console.log('Email received:', email)

		if (typeof email !== 'string' || !is_approved_email(email)) {
			console.log('Email invalid or not approved')
			return fail(400, { email, invalid: true })
		}

		console.log('Generating magic link')
		const magic_link = await generate_magic_link(email, url)
		console.log('Magic link generated:', magic_link)

		console.log('Sending magic link email')
		try {
			await send_magic_link_email(email, magic_link)
			console.log('Magic link email sent successfully')
		} catch (error) {
			console.error('Error sending magic link email:', error)
			return fail(500, { email, error: 'Failed to send magic link' })
		}

		return { success: true }
	},
}
```

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'

	const { form } = $props<{ form: ActionData }>()

	function handle_submit(event: SubmitEvent) {
		console.log('Form submitted')
		// You can remove this prevent default later, it's just for testing
		event.preventDefault()
		const form = event.target as HTMLFormElement
		const email = form.email.value
		console.log('Email submitted:', email)
	}
</script>

<h1>Login</h1>
<form method="POST" use:enhance onsubmit={handle_submit}>
	<input
		type="email"
		name="email"
		placeholder="Enter your email"
		required
	/>
	<button type="submit">Send Magic Link</button>
</form>

{#if form?.success}
	<p>Magic link sent! Check your email.</p>
{:else if form?.invalid}
	<p>Invalid email. Please try again.</p>
{:else if form?.error}
	<p>{form.error}</p>
{/if}
```

## Layout server

```bash
touch src/routes/+layout.server.ts
```

```ts
// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('session')

	// Check if the user is already authenticated and trying to access the login page
	if (session && url.pathname === '/login') {
		throw redirect(302, '/')
	}

	// Check if the user is trying to access a protected route
	if (
		!session &&
		url.pathname !== '/login' &&
		!url.pathname.startsWith('/auth/')
	) {
		throw redirect(302, '/login')
	}

	return {
		user: session ? JSON.parse(session).email : null,
	}
}
```

## Page server

```bash
touch src/routes/+page.server.ts
```

```ts
// src/routes/+page.server.ts
import type { Actions } from './$types'

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' })
		return { success: true }
	},
}
```

## Index page

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'

	const { data } = $props<{ data: PageData }>()
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the
	documentation
</p>

{#if data.user}
	<p>Logged in as: {data.user}</p>
	<form action="?/logout" method="POST" use:enhance>
		<button type="submit">Logout</button>
	</form>
{:else}
	<p>Not logged in. <a href="/login">Login here</a></p>
{/if}
```

## Make pretty, look good

Looks pretty bare at the moment so I'm going to add Tailwind and
daisyUI and use the daisyUI classes to make things pretty.

## Wrapping Up

This implementation provides a secure, JWT-based magic link
authentication flow. It's both user-friendly and robust enough for
serious applications where protecting gated content is crucial.

Remember, security is an ongoing process. Always keep your
dependencies updated and stay informed about best practices in web
security.

Happy coding, and may your auth always be magical! 🧙‍♂️✨
