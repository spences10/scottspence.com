---
date: 2023-06-27
title: Cookie-Based Theme Selection in SvelteKit with daisyUI
tags: ['sveltekit', 'daisyui', 'tailwind', 'how-to']
isPrivate: true
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

I have a [longstanding example project] that uses SvelteKit and
daisyUI for using all the daisyUI themes. If you're interested in how
to this was done before using cookies then check out the files [from
this commit]. You can see I was using [`theme-change`] (again by
[Pouya]) for setting the theme by adding a `data-theme` attribute to
the `html` element.

The example project now uses the approach used by [Script Raccoon]
from their blog post [How to implement a cookie-based dark mode toggle
in SvelteKit]. I've adapted this approach to use the daisyUI themes.

I'm going to need to have a list of all the available themes so I can
check if the user has selected a valid theme. I'm going to add this to
a `src/lib/themes/index.ts` file.

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

You can get a [full list of the themes] from the example repo.

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

If the user has a valid theme then it will return the response from
the original request but with a `transformPageChunk` function that
will replace the `data-theme` attribute with the theme from the
cookie.

Ok, sweet! So where's that `data-theme` attribute go?

The `src/app.html` file, this is where the project is built into when
it's compiled.

Here's what it looks like in the example project:

```html
<!DOCTYPE html>
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
this is the default theme. This is what will be replaced by the
`transformPageChunk` function.

## Persisting User's Theme Selection with Cookies

## Understanding the 'SameSite' Attribute Warning in Firefox

## Configuring 'SameSite' Attribute for Theme Cookies

## Elevating User Experience with Custom Theme Selection

## Conclusion: The Power of Cookie-Based Theme Selection in SvelteKit with DaisyUI

<!-- Links -->

[daisyui]: https://daisyui.com/
[Pouya]: https://twitter.com/Saadeghi
[longstanding example project]:
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
