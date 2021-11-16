---
date: 2021-11-16
title: How to Set Up Svelte with Tailwind CSS
tags: ['tailwind', 'svelte', 'how-to']
isPrivate: true
---

How to set up Tailwind CSS with Svelte, two examples here of adding
Tailwind CSS to a new Svelte project.

ℹ️ Please note at the time of writing SvelteKit is not at v1 but this
will be the default way to create new Svelte projects when SvelteKit
goes to v1.

I'll go through the setup on the default project from each of the
`init` commands with Vite and Svelte.

Both examples will use the [Svelte Add] utility and I'll go through
converting each one from the Svelte scoped CSS over to Tailwind.

## With SvelteKit npm init svelte@next

## With SvelteKit npm init vite@latest

```svelte
<script>
  import logo from "./assets/svelte.png";
  import Counter from "./lib/Counter.svelte";
</script>

<main class="text-center p-4 m-auto">
  <img class="h-64 w-64" src={logo} alt="Svelte Logo" />
  <h1
    class="text-[#ff3e00] uppercase text-6xl font-thin md:leading-5 my-8 mx-auto max-w-none md:max-w-56"
  >
    Hello world!
  </h1>

  <Counter />

  <p class="max-w-56 my-4 mx-auto max-w-none md:leading-5">
    Visit <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte
    apps.
  </p>

  <p class="max-w-56 my-4 mx-auto max-w-none md:leading-5">
    Check out <a
      class="underline underline-dark-500"
      href="https://github.com/sveltejs/kit#readme">SvelteKit</a
    > for the officially supported framework, also powered by Vite!
  </p>
</main>
```

<!-- Links -->

[svelte add]: https://github.com/svelte-add/svelte-add
