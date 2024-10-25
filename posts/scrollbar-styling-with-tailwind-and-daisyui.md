---
date: 2024-10-25
title: Scrollbar Styling with Tailwind and daisyUI
tags: ['css', 'tailwind', 'daisyui', 'how-to']
isPrivate: false
---

Remember when I wrote about
[changing scrollbar colour with Tailwind CSS](https://scottspence.com/posts/change-scrollbar-color-tailwind-css)?
Good times! 😅 Well, I've got a small update on that, and it's all
about specificity and the occasional need for `!important`.

I recently noticed something odd with my scrollbar styles. They worked
perfectly when the mouse was outside the browser window, but as soon
as the cursor entered the styles vanished. After some head-scratching
and investigation, I narrowed it down to a specificity issue, likely
caused by Tailwind's base styles. 🤷

## The specificity struggle

When working with Tailwind CSS and daisyUI, I often find that my
styles aren't applying as expected. This is can be due to specificity
issues, although the Tailwind team are _very_ good at what they do.

## The solution: selective use of `!important`

I know. Using `!important` often feels like admitting defeat. But in
this case, I ran out of talent, this was what I ended up with to have
the scrollbar styles applied consistently.

Here's what worked for me:

```css
/* Firefox */
* {
	scrollbar-width: thin;
	scrollbar-color: oklch(var(--s)) oklch(var(--p)) !important;
}

/* Chrome, Edge, and Safari */
::-webkit-scrollbar {
	width: 15px;
}

::-webkit-scrollbar-track {
	background: oklch(var(--p));
}

::-webkit-scrollbar-thumb {
	background-color: oklch(var(--s));
	border-radius: 14px;
	border: 3px solid oklch(var(--p));
}
```

Notice the `!important` flag on the `scrollbar-color` property for
Firefox. This ensures that the chosen colours are applied, overriding
any conflicting styles. Interestingly, I only needed to use
`!important` for this specific property.

## Why this works

By using `!important` selectively, we're telling the browser, "This
particular style is crucial, don't override it." It's especially
useful when dealing with frameworks like Tailwind and daisyUI, which
can introduce multiple layers of specificity.

## My current `app.css` configuration

For those interested, here's my current `app.css` configuration:

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

/* Scrollbar styles for modern browsers */
* {
	scrollbar-width: thin;
	scrollbar-color: oklch(var(--s)) oklch(var(--p)) !important;
}

/* Webkit browsers (Chrome, Edge, Safari) for compatibility */
::-webkit-scrollbar {
	width: 15px;
}

::-webkit-scrollbar-track {
	background: oklch(var(--p));
}

::-webkit-scrollbar-thumb {
	background-color: oklch(var(--s));
	border-radius: 14px;
	border: 3px solid oklch(var(--p));
}
```

## Wrapping up

Styling scrollbars with Tailwind and daisyUI can be tricky, but with a
little selective `!important`, I can achieved the look I wanted.
Sometimes it's about finding pragmatic solutions to tricky problems.

Happy styling, folks! And remember, if your scrollbars aren't
behaving, sometimes you just need to be a little more... specific. 😅

## References

- `scrollbar-width`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-width
- `scrollbar-color`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
- `::-webkit-scrollbar`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar
- `::-webkit-scrollbar-track`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar-track
- `::-webkit-scrollbar-thumb`:
  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar-thumb
- General information on CSS Scrollbars:
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scrollbars
