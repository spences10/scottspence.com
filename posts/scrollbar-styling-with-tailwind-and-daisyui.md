---
date: 2024-10-25
title: Scrollbar Styling with Tailwind and daisyUI
tags: ['css', 'tailwind', 'daisyui', 'how-to']
isPrivate: false
---

<script>
  import { DateDistance as DD } from '$lib/components'
  import { CodePen } from 'sveltekit-embed'
</script>

Remember when I wrote about
[changing scrollbar colour with Tailwind CSS](https://scottspence.com/posts/change-scrollbar-color-tailwind-css)?
Good times! 😅 Well, that post was <DD date="2022-07-12"/> ago and
stuff don't stay the same for long in modern web dev.

The sitch: I noticed my scrollbar styles were being applied when the
mouse was outside the browser window, but as soon as the cursor
entered the styles went to default. After some dicking around, I
narrowed it down to a specificity issue, likely caused by Tailwind's
base styles. 🤷

When working with Tailwind CSS and daisyUI, I very rarely find that my
styles aren't applying as expected, the Tailwind team are _very_ good
at what they do.

## Browser support

Essentially, if you're not on a Chromium based browser, you're shit
out of luck. Few of the scrollbar selectors are supported outside of
Chromium and the ones that are, are not as visually appealing.

## What I found: selective use of `!important`

I know. Using `!important` often feels like admitting defeat. But in
this case, I ran out of talent, this was what I ended up with to have
the scrollbar styles applied consistently.

Essentially removed all the gumpf relating to the scrollbar styles and
set the width and colour globally. Then added in the fallback
pseudo-elements for WebKit based browsers.

```css
/* 
Scrollbar styles:
	scrollbar-color Two valid colors. thumb and track
	scrollbar-gutter padding when there's no scrollbar
	scrollbar-width auto | thin | none
*/
* {
	scrollbar-width: thin;
	scrollbar-color: oklch(var(--s)) oklch(var(--p)) !important;
}

::-webkit-scrollbar-track {
	background: oklch(var(--p));
}

::-webkit-scrollbar-thumb {
	background-color: oklch(var(--s));
}
```

Notice the `!important` flag on the `scrollbar-color` property. This
ensures that the chosen colours are applied, overriding any
conflicting styles. Is this the default behaviour? Possibly?

I'm not a fan of slapping `!important` on anything, but in this case
it's the only way to get the scrollbar styles to apply consistently.

## My current `app.css` configuration

If you're interested, here's my current `app.css` configuration for
this site:

```css
@tailwind base;

html {
	scroll-behavior: smooth;
	word-break: break-word;
}

::selection {
	color: oklch(var(--pc));
	background: oklch(var(--p));
}

@tailwind components;
@tailwind utilities;

/* 
Scrollbar styles for modern browsers 
	scrollbar-color
	scrollbar-gutter
	scrollbar-width auto | thin | none
*/
* {
	scrollbar-width: auto;
	scrollbar-color: oklch(var(--s)) oklch(var(--p)) !important;
}

::-webkit-scrollbar-track {
	background: oklch(var(--p));
}

::-webkit-scrollbar-thumb {
	background-color: oklch(var(--s));
}
```

## Vanilla CSS example

If you're interested, here's a vanilla CSS example in a CodePen you
can check out:

<CodePen codePenId="wvVpJjY" />

## Wrapping up

It was good to revisit the MDN docs for this, I found a few things I'd
missed before. I got the outcome I wanted here and learned a bit along
the way.

Happy styling, folks! And remember, if your scrollbars aren't
behaving, sometimes you just need to be a little more... specific. 😅

## References

- `scrollbar-width`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width
- `scrollbar-color`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
- `::-webkit-scrollbar`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar
- General information on CSS Scrollbars:
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scrollbars
