---
date: 2022-06-03
title: Change Text Highlight Color with Tailwind CSS
tags: ['css', 'tailwind', 'how-to']
isPrivate: true
---

<script>
  import Details from '$lib/components/details.svelte'
  import Chat from '$lib/components/chat.svelte'
</script>

How to change the highlight color of text on the page. Here's the
situation! I wanted to change the text highlight color to a different
colour than the default blue on my site.

To change the default text highlight color in a Tailwind CSS project
you can add the `::selection` selector the Tailwind file that has the
`@tailwind` directives in it (usually named `app.css` or
`tailwind.css`).

In the selector I can add in the colour that I want to use.

```css
::selection {
  background: red;
}
```

As a side note, my site did have quite a big configuration file for
the scrollbar. You can take a look at what my `app.css` file used to
look like clicking the button.

<Details buttonText="Click to expand">

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
(daisyUI creator) on Twitter that I realized that I could use daisyUI
CSS variables.

Here's how the chat went:

<Chat>
Hey man! If I want to change the selection colors in Tailwind I'll
need to use the daisyUI hardcoded theme colors right?
</Chat>

<Chat reply>
Hey, if the color exists in theme already, you can just use that variable

Over on daisyUI you can see all the variables. for example `--s` is
for `secondary` color

and they're all HSL values

so they should be used like `hsl(var(--s))`

</Chat>

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

<!-- Links -->

[pouya]: https://twitter.com/Saadeghi
