---
date: 2023-06-28
title: Cookie-Based Theme Selection in SvelteKit with daisyUI
tags: ['sveltekit', 'daisyui', 'tailwind', 'how-to']
isPrivate: false
---

<script>
  import {
    DateDistance as DD,
    Banner,
  } from '$lib/components'

  const options = {
    type: 'info',
    message: `If you have more than one handle function then you can use the
      <a target="_blank" rel="noopener noreferrer" href='https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence'>sequence helper function in SvelteKit</a>.
    `
  }
</script>

This guide will cover how to add a cookie-based theme selection to a
SvelteKit site using daisyUI.

I've always liked implementing something in the way of a theme change
into my sites. This often meant that I'd have to define my own theme
up-front with both a light and dark equivalent.

I was super happy when I discovered daisyUI with it's 29 built-in
themes. As someone that struggles with colours (being colour-blind), I
was all in on the provided themes taking a lot of the work out of it
for me.

Since I rebuilt my site with SvelteKit, <DD date='2021-07-17' /> ago
now. I've been using the daisyUI themes as part of the site. The
default is usually what I decide on using in the `app.html` with the
`data-theme` attribute.

This means that there's a "Flash of Unstyled Content" (FOUC) but not
really unstyled. It's more of a "Flash of Wrong Theme" (FOWT), yeah,
it's a term I just discovered whilst writing this post.

This is because the default theme is applied first via the
`data-theme` attribute. If it's a returning visitor and they have
previously selected a theme then the JavaScript kicks in and loads the
users selected theme, giving the FOWT.

## daisyUI's built-in themes

[daisyUI] recently had a v3 launch where [Pouya] did an awesome job
with making a scrollytelling experience on the site which showcases
all the themes available.

You don't have to use them all, you can pick and choose which ones you
want to use in the Tailwind config but I like them all so decided to
include them all.

To tailor what themes you want to use from daisyUI you can add the
`daisyui` config object to the `tailwind.config.js` file:

```js
const daisyui = require('daisyui')

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {},
	},

	daisyui: {
		themes: ['light', 'dark', 'cupcake'],
	},

	plugins: [daisyui],
}

module.exports = config
```

## Theme change in SvelteKit

I have a [long-standing example project] that uses SvelteKit and
daisyUI for using all the daisyUI themes. If you're interested in how
this was done before using cookies then check out the files [from
this commit]. You can see I was using [`theme-change`] (again by
[Pouya]) for setting the theme by adding a `data-theme` attribute to
the `html` element.

The example project now uses the approach used by [Script Raccoon] from
their blog post [How to implement a cookie-based dark mode toggle
in SvelteKit]. I've adapted this approach to use the daisyUI themes.

First up I'm going to need to have a list of all the available themes
from daisyUI so I can check if the user has selected one of the themes
already. I'm going to add this to a `src/lib/themes/index.ts` file.

It looks a little like this:

```ts
export const themes = [
	'acid',
	'aqua',
	'etc...',
	'all-the-daisyui-themes',
]
```

I'm mentioning this now because I'll need this file in the next
section.

If you're interested, you can get a [full list of the themes] from the
example repo.

## SvelteKit server hooks

So, SvelteKit has a `hooks.server.ts` (also `hooks.client.ts`) file
that you can effectively use as middleware, so this means you can
intercept the request from the client to the server before the
response from the server gets back to the client.

<Banner {options} />

To make sure that I'm not reloading the selected theme after the page
has loaded and avoid the "Flash of Wrong Theme" (FOWT) I'm going to
use the `hooks.server.ts` file to set the theme via a cookie before
the page loads by rewriting the `data-theme` attribute.

I'll import the `themes` array from the `src/lib/themes/index.ts` file
and use it to check if the user has selected a valid theme in the
`handle` function.

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

What the code is doing here is checking if the user has a cookie named
`theme` and if it's a valid theme. If it's not a valid theme then it
will just return the response from the original request.

If the user has a theme in the daisyUI themes array then it will
return the response from the original request but with a
`transformPageChunk` function that will replace the `data-theme`
attribute with the theme from the cookie.

Ok, sweet! So where's that `data-theme` attribute go?

The `src/app.html` file, this is where the project is built into when
it's compiled.

Here's what it looks like in the example project:

```html
<!doctype html>
<html lang="en" data-theme="">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

You might notice that the property value is empty, this is because
it's going to get written to each time by the hooks file with the
`transformPageChunk` function if the theme has been set on the client.

## Theme select component

Now I can create the theme select component, for now I'll focus on
getting the themes from the daisyUI themes array and displaying them
in a select element.

```svelte
<script lang="ts">
	import { themes } from './themes'
</script>

<div class="mb-8">
	<select
		data-choose-theme
		class="select select-bordered select-primary w-full max-w-3xl text-xl capitalize"
	>
		<option disabled selected>Choose a theme</option>
		{#each themes as theme}
			<option value={theme} class="capitalize">{theme}</option>
		{/each}
	</select>
</div>
```

Aight! Now I can select through all the themes, but I can't change the
theme yet. So I'll need to create a function that will change the
theme when the user selects a theme from the select box.

I'll add that in now and bind the `on:change` event on the select box
to the function.

```svelte
<script lang="ts">
	import { themes } from './themes'

	function set_theme(event: Event) {
		const select = event.target as HTMLSelectElement
		const theme = select.value
		if (themes.includes(theme)) {
			const one_year = 60 * 60 * 24 * 365
			window.localStorage.setItem('theme', theme)
			document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`
			document.documentElement.setAttribute('data-theme', theme)
			current_theme = theme
		}
	}
</script>

<div class="mb-8">
	<select
		data-choose-theme
		class="select select-bordered select-primary w-full max-w-3xl text-xl capitalize"
		on:change={set_theme}
	>
		<option disabled selected> Choose a theme </option>
		{#each themes as theme}
			<option value={theme} class="capitalize">{theme}</option>
		{/each}
	</select>
</div>
```

So the `set_theme` function is getting the value from the select box
when it changes, checking if the theme is in the daisyUI themes array
and if it is then it's setting the theme in the `localStorage`.

Then it creates a cookie which is storing the theme name in it, it's
also setting the `max-age` to one year, the `path` to `/` (so for the
whole site).

Lastly it's setting the `data-theme` attribute on the
`documentElement` to the selected theme.

That's great! Now when I refresh the page there's no "Flash of Wrong
Theme" (FOWT)

BUT! The selected theme isn't shown in the select box and it defaults
back to the first item in the box. So there's no indication of what
theme is being used.

So, I'll expand on the current example by creating a variable to store
the current theme. Once the page has loaded I'll check if the user has
a theme set in the `localStorage` and if they do then I can update the
current theme variable to the theme from `localStorage`.

```svelte
<script lang="ts">
	import { onMount } from 'svelte'
	import { themes } from './themes'

	let current_theme = ''

	onMount(() => {
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
			document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`
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
		on:change={set_theme}
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

I can then bind the `value` of the select box to the `current_theme`
variable and set the `disabled` attribute on the first option to
disable it if the `current_theme` variable is not empty.

Sweet!

## 'SameSite' Attribute Warning in Firefox

When I was working with this in development I encountered a warning in
Firefox stating: "Cookie does not have a proper SameSite attribute
value".

So, Firefox is saying it needs more instructions on how to use the
site's cookies.

Cookies are like reminders, or in this case a way of telling the
browser the users preference. The `SameSite` attribute is a rule that
tells the browser when and where it's okay to share this information.

Firefox and other browsers want website developers to make clear rules
for their cookies. If you don't, Firefox will make a safe but limited
rule for you and display that warning to let you know.

## Configuring 'SameSite' Attribute for Theme Cookies

So, how can I make a clear rule for my theme cookies and get rid of
that warning? The SameSite attribute has three options: `Strict`,
`Lax`, and `None`.

- `Strict`: This is like a "keep to self" rule. The browser will only
  use the cookies on my site and won't share them anywhere else.
- `Lax`: This rule is a bit relaxed (hence 'Lax'). The browser can use
  the cookies on my site and also when you click a link that takes you
  to another site.
- `None`: This is like a "share with everyone" rule. The browser can
  use cookies on any site. But, because it's not very safe, it must be
  paired with another rule that says "only share over secure
  connections".

In my case, the `Strict` rule is the best fit. It's only needed for
this site.

So, in the `set_theme` function I can add the `SameSite` attribute to
where the cookie is being set.

```ts
function set_theme(event: Event) {
	const select = event.target as HTMLSelectElement
	const theme = select.value
	if (themes.includes(theme)) {
		const one_year = 60 * 60 * 24 * 365
		window.localStorage.setItem('theme', theme)
		document.cookie = `theme=${theme}; max-age=${one_year}; path=/; SameSite=Strict;`
		document.documentElement.setAttribute('data-theme', theme)
		current_theme = theme
	}
}
```

## Conclusion

There you go! A guide to implementing cookie-based theme selection in
SvelteKit using daisyUI.

Through the use of cookies, I was able to eliminate the "Flash of
Wrong Theme" effect, giving a seamless transition for the selected
theme.

The SameSite attribute was an interesting touch, ensuring cookies are
used in a secure and controlled manner.

Even though the cookie is non-essential, setting appropriate security
measures is a good practice.

In this guide, I leveraged various aspects of SvelteKit, including
server hooks and lifecycle functions.

## Thanks

Once again thanks to [Script Raccoon] for the great article on [How to
implement a cookie-based dark mode toggle in SvelteKit].

Also thanks to [Pouya] for [daisyUI] chef kiss!

<!-- Links -->

[daisyui]: https://daisyui.com/
[Pouya]: https://twitter.com/Saadeghi
[long-standing example project]:
	https://github.com/spences10/sveltekit-theme-switch-example
[from this commit]:
	https://github.com/spences10/sveltekit-theme-switch-example/blob/1f9b4f9b5f5aa0a521f68a21dc0b17e5ec89d625/src/routes/%2Blayout.svelte
[`theme-change`]: https://github.com/saadeghi/theme-change
[How to implement a cookie-based dark mode toggle in SvelteKit]:
	https://scriptraccoon.dev/blog/darkmode-toggle-sveltekit
[Script Raccoon]: https://scriptraccoon.dev
[`sequence` helper function]:
	https://kit.svelte.dev/docs/modules#sveltejs-kit-hooks-sequence
[full list of the themes]:
	https://github.com/spences10/sveltekit-theme-switch-example/blob/5489c1843b42bb8c3162e22760a55b88a3e7c0b0/src/lib/themes/index.ts
