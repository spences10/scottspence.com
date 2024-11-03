---
date: 2023-01-06
title: Gradient animations with Tailwind CSS and SvelteKit
tags: ['css', 'tailwind', 'how-to', 'svelte', 'sveltekit']
isPrivate: false
---

<!-- cSpell:ignore Yoalli -->

Tailwind is cool, right? Really configurable as well, I wanted to add
some gradient animation to a project of mine. So did a search and
found this awesome post by [Victor Yoalli] on how to do it! Thanks Victor!

I've basically taken Victor's code and adjusted it for use with daisUI
to apply to the effect to some text rather than to a div as with
Victor's example.

I'll put this in an example project on GitHub so if you want to
**Tl;Dr** and see the sauce you can [skip to the end](#conclusion).

In this post I'll create an example project using SvelteKit, Tailwind
CSS and daisyUI.

By the way, this doesn't need to be a SvelteKit project, or with
Tailwind CSS. This is my preferred stack, but you can use whatever you
like.

## Spin up the project

It's really convenient to get setup with a SvelteKit now, if you have
node installed on your machine you can run the following command to
get started:

```bash
pnpm create svelte gradient-animation-example
```

I'll pick the following options, you can pick whatever you like, live
your life! 😎

```bash
? Which Svelte app template? › - Use arrow-keys. Return to submit.
    SvelteKit demo app
❯   Skeleton project - Barebones scaffolding for your new SvelteKit app
    Library skeleton project
? Add type checking with TypeScript? › - Use arrow-keys. Return to submit.
    Yes, using JavaScript with JSDoc comments
❯   Yes, using TypeScript syntax
    No
? Add ESLint for code linting? › Yes
? Add Prettier for code formatting? › Yes
? Add Playwright for browser testing? › No
? Add Vitest for unit testing? › No
```

I'll follow the rest of the instructions from the CLI output, if you
take a look at the output there's something handy on there I'll be
using shortly too!

```bash
Your project is ready!
✔ Typescript
  Inside Svelte components, use <script lang="ts">
✔ ESLint
  https://github.com/sveltejs/eslint-plugin-svelte3
✔ Prettier
  https://prettier.io/docs/en/options.html
  https://github.com/sveltejs/prettier-plugin-svelte#options

Install community-maintained integrations:
  https://github.com/svelte-add/svelte-adders

Next steps:
  1: cd gradient-animation-example
  2: npm install (or pnpm install, etc)
  3: git init && git add -A && git commit -m "Initial commit" (optional)
  4: npm run dev -- --open
```

I use `pnpm` as my package manager, so all the commands in this
example will be using that. If you're using `npm` or `yarn` you'll
need to adjust the commands accordingly.

## Add Tailwind CSS with daisyUI

The handy thing I'm using from the CLI output is the [`svelte-add`] I
can use it to add Tailwind CSS and daisyUI to my project. There's
additional flags for `--typography` and `--forms` too for this example
I'll just be using daisyUI.

```bash
npx svelte-add@latest tailwindcss --daisyui
```

Now, as I committed the changes after the initial project setup I can
take a look at what's changed after running the `svelte-add` command.

[![sveltekit-skeleton-project-with-svelte-add-tailwind-changes]]
[sveltekit-skeleton-project-with-svelte-add-tailwind-changes]

`svelte-add` created a `+layout.svelte`, `app.postcss`,
`postcss.config.cjs` and a `tailwind.config.cjs` file for me, that's
the Tailwind CSS setup done now!

I'll rename the `app.postcss` file to a regular CSS file.

```bash
# rename the file
mv src/app.postcss src/app.css
```

Then update the reference to it in the `+layout.svelte` file.

```git
<script>
+ import '../app.css';
- import '../app.postcss';
</script>

<slot />
```

## Add the gradient animation

This is taken straight from Victor's post, I've added the `theme`
config from this post to the `tailwind.config.js` file.

```js
const daisyui = require('daisyui')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			animation: {
				'gradient-x': 'gradient-x 5s ease infinite',
				'gradient-y': 'gradient-y 5s ease infinite',
				'gradient-xy': 'gradient-xy 5s ease infinite',
			},
			keyframes: {
				'gradient-y': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'center top',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'center center',
					},
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
				'gradient-xy': {
					'0%, 100%': {
						'background-size': '400% 400%',
						'background-position': 'left center',
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center',
					},
				},
			},
		},
	},

	plugins: [daisyui],
}

module.exports = config
```

This means that I can now use any of the `gradient-x`,`gradient-y` or
`gradient-xy` classes in the project. So I'll go ahead and do that
now!

So, going back to Victor's post, and the explanation he gives there,
the three classes created here are for, one moving on the horizontal
axis (`gradient-x`). One moving on the vertical axis (`gradient-y`),
and the last one moving on the diagonal axis (`gradient-xy`).

## Use the gradient classes in some markup

That's it! Now let's add them to some markup on `+page.svelte`.

I want the text to have the gradient and not the background, so I'll
use the Tailwind `bg-clip-text` and `bg-clip-text text-transparent`
classes to do that. Then I can apply a gradient to the text using the
`bg-gradient-to-r` class.

And for the colours I'll use the daisyUI classes `from-primary`,
`to-secondary`, `via-accent` to cycle through the colours in the
theme.

```svelte
<h1
	class="from-primary to-secondary via-accent animate-gradient-xy bg-gradient-to-tr bg-clip-text text-transparent"
>
	Tailwind Gradient Text
</h1>
<p
	class="from-primary to-secondary via-accent animate-gradient-y bg-gradient-to-br bg-clip-text text-transparent"
>
	This animation is on the vertical axis
</p>
<p
	class="from-primary to-secondary via-accent animate-gradient-x bg-gradient-to-tl bg-clip-text text-transparent"
>
	This animation is on the horizontal axis
</p>
```

Then finally, I'll can add in a wrapping element and add in some font
styles.

```svelte
<div class="flex h-screen flex-col items-center justify-center">
	<h1
		class="from-primary to-secondary via-accent animate-gradient-xy bg-gradient-to-tr bg-clip-text py-8 text-6xl font-extrabold text-transparent md:text-9xl"
	>
		Tailwind Gradient Text
	</h1>
	<p
		class="from-primary to-secondary via-accent animate-gradient-y bg-gradient-to-br bg-clip-text py-8 text-3xl font-extrabold text-transparent md:text-6xl"
	>
		This animation is on the vertical axis
	</p>
	<p
		class="from-primary to-secondary via-accent animate-gradient-x bg-gradient-to-tl bg-clip-text py-8 text-3xl font-extrabold text-transparent md:text-6xl"
	>
		This animation is on the horizontal axis
	</p>
</div>
```

And that it! A nice little gradient animation on some text.

## Conclusion

If you want to check out the code for it I've put the example over on
[GitHub] if you want to take a look at it.

I hope you enjoyed this post, and that you found it useful. If you did
please consider sharing it on the socials! 😊

<!-- Links -->

[victor yoalli]:
	https://victoryoalli.me/how-to-create-an-animated-gradient-using-tailwin-css
[`svelte-add`]: https://github.com/svelte-add/svelte-adders
[github]: https://github.com/spences10/gradient-animation-example

<!-- Images -->

[sveltekit-skeleton-project-with-svelte-add-tailwind-changes]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1673023278/scottspence.com/sveltekit-skeleton-project-with-svelte-add-tailwind-changes.png
