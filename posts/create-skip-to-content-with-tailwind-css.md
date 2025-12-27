---
date: 2022-04-16
title: Create Skip To Content With Tailwind CSS
tags: ['tailwind', 'css', 'how-to']
is_private: false
---

<script>
  import { CodePen } from 'sveltekit-embed'
</script>

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

At the time of writing this site is made with Svelte and Tailwind CSS.

Here's what the skip to content looks like for this site:

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

Without going into how SvelteKit works here I'll cover what is going
on here then provide a more generic example using plain o'l HTML.

So generally you want the link to be one of the first links on the
site, and that need to link to an id on the page to go to once it's
clicked.

In the example above I have an `a` tag linking to an id on the page of
`main-content` this is where I want to go to when the 'Skip to
content' link is clicked.

Here's the most basic example of how it could look:

```html
<body>
  <header>
    <a class="skip-to-content" href="#main-content">
      Skip to content
    </a>

    <nav>
      <ul>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">About</a>
        </li>
        <li>
          <a href="#">Stuff</a>
        </li>
      </ul>
    </nav>
  </header>
  <div>
    <p class="hero-content">Skip to Content example</p>
    <p class="hero-content">Use Tab to show link</p>
  </div>
  <main id="main-content">Main content here...</main>
</body>
```

There could be a lot of information between the header and the main
content so clinking the link here will scroll the page down to the
`main-content` id.

So currently that's working, does what it's meant to do, but I don't
always want the 'Skip to content' link showing at the top of the page.

So I can use a bit of CSS to hide it.

```css
.skip-to-content {
  position: absolute;
  transform: translateY(-150%);
}
```

Adding position absolute will take the link out of the flow of the
page so here is where I can hide it by moving it off of the page.
Rather than adding a negative top to it here, which seem the most
obvious I'm adding a negative transform to it.

Why the transform? I want to add a tiny bit of animation to it and
animations are a lot more performant on transforms than on top, right,
bottom, left.

So I'll add a transition to the class and reset the transform back to
0 when the `a` tag is focused, this will slide the link into view.

```css
.skip-to-content {
  position: absolute;
  transform: translateY(-150%);
  transition: transform 150ms ease-in;
}

.skip-to-content:focus {
  transform: translateY(0);
}
```

That's it!

You can check out this [Codepen] for and example of this in action.

<CodePen codePenId="WNMvXpa" />

<!-- Links -->

[codepen]: https://codepen.io/spences10/pen/WNMvXpa
