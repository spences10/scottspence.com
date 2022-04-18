---
date: 2022-04-16
title: Create Skip To Content With Tailwind CSS
tags: ['tailwind', 'css', 'how-to']
isPrivate: true
---

Skip links are internal links that allow you to skip to the main
content of the page.

So on this page, if you hit the tab key you'll see a skip navigation
button, something like this:

<div class="flex justify-center">
  <button class="btn p-3 bg-primary text-primary-content hover:text-primary-focus">
    Skip Navigation 
  </button>
</div>

This is an accessibility improvement that lets keyboard users skip all
the navigation links and move to the main content of the page.

```svelte
<a
  class="transition left-0 bg-primary text-primary-content absolute p-3 m-3 -translate-y-16 focus:translate-y-0"
  href="#main-content">Skip Navigation</a
>
<Header />
<Nav />
<main
  id="main-content"
  class="container max-w-3xl mx-auto px-4 mb-20"
>
  <slot />
</main>

<Footer />
```
