---
date: 2025-02-11
title:
  Theme Switching in SvelteKit Updated for daisyUI v5 and Tailwind v4
tags: ['sveltekit', 'daisyui', 'tailwind', 'how-to']
is_private: false
---

Aight! Let's go over the migration from Tailwind v3 to v4 and daisyUI
v3 to v5 in a SvelteKit project, I'll not go into a massive preamble
here on the improvements that Tailwind v4 brings, essentially , it
good, it faster, it simpler, with modern features and a CSS-first
configuration. Just go check out
[the blog post on it](https://tailwindcss.com/blog/tailwindcss-v4) for
all the details. Also, daisyUI has some awesome new features check out
the [beta release notes](https://v5.daisyui.com/docs/v5-beta) for
that!

But, what an upgrade to Tailwind v4 means for a lot of people though,
is breaking changes! 😅

There's a few things that have changed! I'm going to go through the
full setup as if I were starting from scratch. If you want to know how
to do a migration then **Tl;Dr:** [How'd I do it?](#howd-i-do-it)

I'll breeze through this, the full details on how I do the theme
switch is detailed in the
[Cookie-Based Theme Selection in SvelteKit with daisyUI](https://scottspence.com/posts/cookie-based-theme-selection-in-sveltekit-with-daisyui)
post.

## Init the project

So, from scratch, the Svelte (`sv`) CLI is going to do a lot of the
heavy lifting for me, essentially adding the config for me in
`vite.config.ts` and setting up the `app.css` file.

```bash
npx sv@latest create sveltekit-theme-switch-example
```

In the CLI options I'll go for my default, you can pick what you like,
go bananas! This is my default for every project:

```bash
npx sv@latest create delete-me
┌  Welcome to the Svelte CLI! (v0.6.21)
│
◇  Which template would you like?
│  SvelteKit minimal
│
◇  Add type checking with Typescript?
│  Yes, using Typescript syntax
│
◆  Project created
│
◆  What would you like to add to your project? (use arrow keys / space bar)
│  ◼ prettier
│  ◼ eslint
│  ◼ vitest
│  ◼ playwright
│  ◼ tailwindcss (css framework - https://tailwindcss.com)
│  ◻ sveltekit-adapter
│  ◻ drizzle
│  ◻ lucia
│  ◻ mdsvex
│  ◻ paraglide
│  ◻ storybook
└
```

Essentially the `tailwindcss` pick there will add the correct
dependencies and config for me!

I'm using daisyUI too so, install that, it's still beta at the time of
writing this so I'm using the `@beta` tag! I also use the
`@tailwindcss/typography` plugin a lot so I'll install that, then I'll
take a look at customising them later! For now, INSTALL!!

```bash
pnpm i -D daisyui@beta @tailwindcss/typography
```

Aight, so, now I've installed the plugins for daisyUI and prose
(Tailwind typography plugin) I'll need to config them in the `app.css`
file:

```css
@import 'tailwindcss';

/* Plugins and configuration */
@plugin "@tailwindcss/typography";
@plugin "daisyui";
```

Then run the dev server, check stuff out! Checks out! Default daisyUI
theme applied!

## The THEMES!!

daisyUI comes with 35 themes to choose from! I'm going to use them
all! There's a load of config information over on the
[docs for daisyUI themes](https://v5.daisyui.com/docs/themes) for now,
I'll use all the themes by adding that to the config.

```css
@import 'tailwindcss';

/* Plugins and configuration */
@plugin "@tailwindcss/typography";
@plugin "daisyui" {
	themes: all;
}
```

## Switch theme

Ok, now I have my pick of all the themes! How do I select them though?
I can use the `data-theme` attribute in the `src/app.html` file to
switch them!

```diff
-<html lang="en">
+<html lang="en" data-theme="light">
```

But, I'm not going to be updating that each time I want to change the
theme, so, instead I'll use a SvelteKit hooks file to transform this
for me!

So, rather than leave the theme set to light, I'll leave this
attribute empty so that the hooks file can populate it.

```diff
-<html lang="en" data-theme="light">
+<html lang="en" data-theme="">
```

Now, onto the hooks file!

## SvelteKit hooks file

I'll create a `src/hooks.server.ts` file:

```bash
touch src/hooks.server.ts
```

Then in there I'll create a little hook that'll handle switching the
theme for me if there's a cookie for it by writing the HTML for the
`data-theme` attribute!

```ts
import { themes } from '$lib/themes'

export const handle = async ({ event, resolve }) => {
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
```

But, right now, there's no cookies! HOW DO I SET THE COOKIE??!!!1

I'll do that in the theme select component.

## Theme select component

I'll make a component that will essentially set a cookie with the
currently selected theme.

When the component initialises it will either pick the theme from
local storage or default to nothing.

I'll create the file:

```bash
touch src/lib/theme-select.svelte
```

Then add in this:

```svelte
<script lang="ts">
	import { themes } from './themes'

	let current_theme = $state('')

	$effect(() => {
		if (typeof window !== 'undefined') {
			const theme = window.localStorage.getItem('theme')
			if (theme && themes.includes(theme)) {
				document.documentElement.setAttribute('data-theme', theme)
				current_theme = theme
			}
		}
	})

	function set_theme(event: Event) {
		const select = event.target as HTMLSelectElement
		const theme = select.value
		if (themes.includes(theme)) {
			const one_year = 60 * 60 * 24 * 365
			window.localStorage.setItem('theme', theme)
			document.cookie = `theme=${theme}; max-age=${one_year}; path=/; SameSite=Lax`
			document.documentElement.setAttribute('data-theme', theme)
			current_theme = theme
		}
	}
</script>

<div class="mb-8">
	<select
		bind:value={current_theme}
		data-choose-theme
		class="select select-bordered select-primary w-full max-w-3xl text-xl capitalize"
		onchange={set_theme}
	>
		<option value="" disabled={current_theme !== ''}>
			Choose a theme
		</option>
		{#each themes as theme}
			<option value={theme} class="capitalize">{theme}</option>
		{/each}
	</select>
</div>
```

This is going to see (via `$effect`) if there's a `theme` in local
storage and set the theme to that via the `bind` directive to set the
value for that element (the select).

Where are the themes though? I'll create that file now:

```bash
touch src/lib/themes.ts
```

Then add in all the themes!

<!-- cspell:ignore caramellatte -->

```ts
export const themes = [
	'abyss',
	'acid',
	'aqua',
	'autumn',
	'black',
	'bumblebee',
	'business',
	'caramellatte',
	'cmyk',
	'coffee',
	'corporate',
	'cupcake',
	'cyberpunk',
	'dark',
	'dim',
	'dracula',
	'emerald',
	'fantasy',
	'forest',
	'garden',
	'halloween',
	'lemonade',
	'light',
	'lofi',
	'luxury',
	'night',
	'nord',
	'pastel',
	'retro',
	'silk',
	'sunset',
	'synthwave',
	'valentine',
	'winter',
	'wireframe',
]
```

Now I can add the theme select (in this case) to the
`src/routes/+page.svelte` file to test it out:

```diff
-<h1>Welcome to SvelteKit</h1>
-<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

+<script lang="ts">
+	import ThemeSelect from '$lib/theme-select.svelte';
+</script>

+<ThemeSelect />
```

And that's it, I can now start selecting themes away!

That's essentially it! Note, when the page reloads there's no flash of
unstyled content (FOUC) because the theme is set before the page loads
and the CSS kicks in!

## What about the plugin customisation?

There's some good stuff in here on customising the typography plugin:
https://github.com/tailwindlabs/tailwindcss-typography/issues/372

I used a lot of the information from that to make my own
customisations that are detailed in the
[How'd I do it?](#howd-i-do-it) section, check out the PR in there.

## Migration path

Tried the
[upgrade tool](https://tailwindcss.com/docs/upgrade-guide#using-the-upgrade-tool)
`npx @tailwindcss/upgrade@next --force` and it didn't do a great job
(for me!) give it a try and see if it works for you.

The migration path (AGAIN for me!) was to do it manually. Essentially,
what I did was this, with extra steps!

upgrade:

- `tailwindcss`
- `daisyui`

remove:

- `autoprefixer`
- `postcss.config.js`
- `tailwind.config.ts`

add:

- `@eslint/js`
- `@tailwindcss/vite`

use:

- `import tailwindcss from '@tailwindcss/vite'` in `vite.config.ts`

See links in the next section for more details.

## How'd I do it?

I've done this migration now on the
[sveltekit-theme-switch-example](https://github.com/spences10/sveltekit-theme-switch-example)
project and this site!

Check out the changes for the migration on this site
[from this pull request](https://github.com/spences10/scottspence.com/pull/1014/files).

The commit going from Tailwind v3 to v4 and daisyUI v3 to v5 on the
example project is
[here](https://github.com/spences10/sveltekit-theme-switch-example/commit/2dabbe9a0a3524ac0ddc94bf31372012631a3427).

## Conclusion

Aight! That's it! The migration path from Tailwind v3 to v4 with
daisyUI v5, it was a bit of a head scratcher for me to begin with, so,
I hope this helps!

To recap what I did:

- Created a new SvelteKit project
- Added the new Tailwind v4 and daisyUI v5 config
- Set up theme switching with cookies and local storage

This should be a good starting point for getting started with a theme
switch in your SvelteKit projects or help with a migration if you have
to go through it!
