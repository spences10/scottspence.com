---
date: 2023-06-27
title: Cookie-Based Theme Selection in SvelteKit with daisyUI
tags: ['sveltekit', 'daisyui', 'tailwind', 'how-to']
isPrivate: true
---

<script>
  import {
    DateDistance as DD
  } from '$lib/components'
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

## Server hooks

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
