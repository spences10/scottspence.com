---
date: 2022-06-03
title: Change Text Highlight Color with Tailwind CSS
tags: ['css', 'tailwind', 'how-to']
is_private: false
---

<script>
  import { Chat, Details } from '$lib/components'
</script>

How to change the highlight color of text on the page? Here's the
situation! I wanted to change the text highlight color to a different
colour than the default blue on my site.

To change the default text highlight color in a Tailwind CSS project
you can add the `::selection` selector to the Tailwind file that has
the `@tailwind` directives in it (usually named `app.css` or
`tailwind.css`).

In the selector I can add in the colour that I want to use.

```css
::selection {
	background: red;
}
```

That's setting it to one colour though, and I want to change this
along with the primary colour of my theme.

So now when some <mark class='text-primary-content bg-primary'>text is
highlighted</mark> it shows the theme colour.

As a side note, my site did have quite a big configuration file for
the scrollbar. You can take a look at what my `app.css` file used to
look like by clicking the button.

<Details button_text="Click to expand">

```css
@tailwind base;

/* 
  These are the styles from DaisyUI needed 
  for the scroll bar colours 
*/
:root {
	/* Default is Dark */
	--primary: #793ef9;
	--secondary: #f000b8;
}
[data-theme='acid'] {
	--primary: #ff00f4;
	--secondary: #ff7400;
}
/* 
  every other daisyUI theme name
  removed for brevity
*/

/* Scrollbar styles */

/* Firefox */
* {
	scrollbar-width: thin;
	scrollbar-color: var(--secondary) var(--primary);
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
	width: 15px;
}

*::-webkit-scrollbar-track {
	background: var(--primary);
	border-radius: 5px;
}

*::-webkit-scrollbar-thumb {
	background-color: var(--secondary);
	border-radius: 14px;
	border: 3px solid var(--primary);
}

@tailwind components;
@tailwind utilities;
```

</Details>

I'm mentioning this because I was using my own CSS variables for the
theme change. It wasn't until I messaged the massively helpful [Pouya]
(daisyUI creator) on Twitter that I realised that I could use daisyUI
CSS variables.

Here's how the chat went:

<Chat>

Hey man! If I want to change the selection colors in Tailwind I'll
need to use the daisyUI hardcoded theme colors right?

</Chat>

<Chat reply>

Hey, if the color exists in theme already, you can just use that
variable

Over on daisyUI you can see all the variables. for example `--s` is
for `secondary` color

and they're all HSL values

so they should be used like `hsl(var(--s))`

</Chat>

<!-- cSpell:ignore whaaaa -->

<Chat>

whaaaa??

So I can use a variable instead of hardcoding in all the values??

</Chat>

<Chat reply>

Yeah 😅 all colors are CSS variables already

</Chat>

<Chat>

Sweet! I didn't know they were accessible in the main `tailwind.css`
file. Thanks! 🙏

</Chat>

Pouya mentioned that I can get the daisyUI colours from the [colors
section] of the daisyUI docs.

So with this information I set about making the `::selection` selector
in my `app.css` file. The CSS looks like this for it now:

```css
::selection {
	color: hsl(var(--pc));
	background: hsl(var(--p));
}
```

With this new information I reduced the `app.css` file in my project
from 178 to 57 lines of code! 😅

You can take a look at the file here (by clicking the button) with
some additional CSS removed. Or you can check out the file over on
[GitHub].

<Details button_text="Click to expand">

<!-- cSpell:ignore behavior -->

```css
@tailwind base;

html {
	scroll-behavior: smooth;
	word-break: break-word;
}

::selection {
	color: hsl(var(--pc));
	background: hsl(var(--p));
}

/* Scrollbar styles */

/* Firefox */
* {
	scrollbar-width: thin;
	scrollbar-color: hsl(var(--s)) hsl(var(--p));
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
	width: 15px;
}

*::-webkit-scrollbar-track {
	background: hsl(var(--p));
	border-radius: 5px;
}

*::-webkit-scrollbar-thumb {
	background-color: hsl(var(--s));
	border-radius: 14px;
	border: 3px solid hsl(var(--p));
}

@tailwind components;
@tailwind utilities;
```

</Details>

That's it!

If you want to [Change Browser Scrollbar Colour with Tailwind CSS]
then check out the post where I go into more detail about that.

Also there's a post on [Gradient animations with Tailwind CSS and
SvelteKit] that you can check out.

Hope you find it useful, I know I did! 😊

<!-- Links -->

[pouya]: https://twitter.com/Saadeghi
[colors section]: https://daisyui.com/docs/colors/
[github]:
	https://github.com/spences10/scottspence.com/blob/edd5b9cf3b8a26893edb36505e2b66dc73e14923/src/app.css
[change browser scrollbar colour with tailwind css]:
	https://scottspence.com/posts/change-scrollbar-color-tailwind-css
[gradient animations with tailwind css and sveltekit]:
	https://scottspence.com/posts/gradient-animations-in-tailwindcss
