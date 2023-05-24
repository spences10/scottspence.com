---
date: 2022-07-12
title: Change Browser Scrollbar Colour with Tailwind CSS
tags: ['css', 'tailwind', 'how-to']
isPrivate: false
---

<script>
  import { CodePen } from 'sveltekit-embed'
</script>

Styling a scrollbar with Tailwind CSS for Chrome, Edge, Safari and
Firefox. This is possible with [vendor prefixes] and
[pseudo-elements].

I touched on the configuration for this in the [Change Text Highlight
Color with Tailwind CSS] post I did recently.

So, I'll go over how to do this in Tailwind CSS then I can go over it
with a vanilla CSS example too.

## Tailwind example

In the main (global) CSS file for Tailwind, usually generated for you
when using a config tool but typically named `app.css` or
`tailwind.css`. The file that has the Tailwind `@tailwind` directives
in it, it should look something like this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

This file is where you'd add in any global styles, in this case for
the scrollbars you'd need to add it between `@tailwind base;` and
`@tailwind components;` for Firefox add in the CSS for [CSS
Scrollbars]:

```css
@tailwind base;

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--secondary) var(--primary);
}

@tailwind components;
@tailwind utilities;
```

That example uses CSS variables for the `--secondary` and `--primary`
colours of the scrollbar. These would typically be defined in a
`:root` element, something like this:

```css
:root {
  --primary: rebeccapurple;
  --secondary: cornflowerblue;
}
```

For Chrome, Edge, and Safari, use the vendor prefix pseudo-elements:

```css
@tailwind base;

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

Only the colours are added to variables here but you could also use
them for the `width` and `border-radius`. Go nuts! 😊

## Vanilla CSS example

Ok, so here's a vanilla CSS example in a CodePen you can check out:

<!-- cSpell:ignore GRxjpbQ -->

<CodePen codePenId="GRxjpbQ" />

As a bonus you don't have to have the `background-color` as a solid
colour, you could have a stripey scrollbar:

```css
background: repeating-linear-gradient(
  45deg,
  var(--secondary),
  var(--secondary) 5px,
  var(--primary) 5px,
  var(--primary) 10px
);
```

Or you could even use an image!

## Conclusion

So there you have it, really simple way to style a scrollbar with CSS!

If you want to [Change Text Highlight Color with Tailwind CSS] you can
check out that post too.

There's also a post on [Gradient animations with Tailwind CSS and
SvelteKit] you might find interesting.

<!-- Links -->

[change text highlight color with tailwind css]:
  https://scottspence.com/posts/change-text-highlight-colour-with-tailwind-css
[vendor prefixes]:
  https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix
[pseudo-elements]:
  https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
[css scrollbars]:
  https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scrollbars
[gradient animations with tailwind css and sveltekit]:
  https://scottspence.com/posts/gradient-animations-in-tailwindcss
