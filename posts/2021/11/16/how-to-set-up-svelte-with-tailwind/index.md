---
date: 2021-11-16
title: How to Set Up Svelte with Tailwind CSS
tags: ['tailwind', 'svelte', 'how-to']
isPrivate: false
---

How to set up Tailwind CSS with Svelte, two examples here of adding
Tailwind CSS to a new Svelte project.

ℹ️ Please note at the time of writing SvelteKit is not at v1 but this
will be the default way to create new Svelte projects when SvelteKit
goes to v1.

I'll go through the setup on the default project from each of the
`init` commands with both Vite and Svelte. I'll then reuse the styles
on the index page of both projects to convert them to use Tailwind.

Both examples will use the [Svelte Add] utility and I'll go through
converting each one from the Svelte scoped CSS over to Tailwind.

## Prerequisites

If you're following along and you have found this via a search I'll
presume you already have a development environment set up with Node
(v14+) and a terminal.

## With SvelteKit `npm init svelte@next`

I'll start up a new Svelte project is with the `npm init svelte@next`
command and give it a name `tailwind-svelte`.

```bash
npm init svelte@next tailwind-svelte
```

I'll choose the following options from the CLI:

```bash
✔ Which Svelte app template? › SvelteKit demo app
✔ Use TypeScript? › No
✔ Add ESLint for code linting? › No
✔ Add Prettier for code formatting? › Yes
```

I'll follow the instructions from the CLI to change directory into the
project and install the dependencies and initialise git to help
highlight the changes:

```bash
cd tailwind-svelte
npm install # (or pnpm install, etc)
git init && git add -A && git commit -m "Initial commit" # (optional step)
npm run dev -- --open
```

Once the dev server has run the project I'll do a quick check that the
demo app is functioning as expected then I can add in Tailwind with
Svelte Add:

```bash
# kill the dev server if it's still running with Ctrl+c
npx svelte-add@latest tailwindcss
# install the newly configured dependencies
npm i
```

After running the install command my source control side panel in VS
Code looks like this.

![changes-after-svelte-add-tailwind]

That's it! All the configuration needed to use Tailwind in a Svelte
project! If that's all you needed to know then cool! The rest of this
will be me replicating the existing styles with Tailwind classes.

Now to start with removing the styles and use Tailwind!

ℹ️ As I mentioned at the beginning I'll only be applying Tailwind
classes to the index page here which is (`src/routes.index.svelte`).

I'll start by removing the `<style>` for the index page, here's the
git diff on the `src/routes.index.svelte` file:

```git
<script context="module">
  export const prerender = true
</script>

<script>
  import Counter from '$lib/Counter.svelte'
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>
    <div class="welcome">
      <picture>
        <source srcset="svelte-welcome.webp" type="image/webp" />
        <img src="svelte-welcome.png" alt="Welcome" />
      </picture>
    </div>

    to your new<br />SvelteKit app
  </h1>

  <h2>
    try editing <strong>src/routes/index.svelte</strong>
  </h2>

  <Counter />
</section>

-<style>
-  section {
-    display: flex;
-    flex-direction: column;
-    justify-content: center;
-    align-items: center;
-    flex: 1;
-  }
-
-  h1 {
-    width: 100%;
-  }
-
-  .welcome {
-    position: relative;
-    width: 100%;
-    height: 0;
-    padding: 0 0 calc(100% * 495 / 2048) 0;
-  }
-
-  .welcome img {
-    position: absolute;
-    width: 100%;
-    height: 100%;
-    top: 0;
-    display: block;
-  }
-</style>
```

So the whole bottom section for the `<style>` tags removed as I'll be
adding the Tailwind classes to the HTML elements.

To recreate the `<section>` classes I've added the git diff here:

```git
+<section class="flex flex-col justify-center items-center flex-1">
+  <h1 class="w-full">
+    <div class="relative w-full pb-[calc(100% * 495 / 2048)]">
      <picture>
        <source srcset="svelte-welcome.webp" type="image/webp" />
        <img src="svelte-welcome.png" alt="Welcome" />
      </picture>
    </div>

    to your new<br />SvelteKit app
  </h1>

  <h2>
    try editing <strong>src/routes/index.svelte</strong>
  </h2>

  <Counter />
</section>
```

That's it for this file, if you want to tackle the rest of the project
take special note of the `src/app.css` file, there are a lot of global
styles are defined.

Moving onto doing it with Vite!

## With SvelteKit `npm init vite@latest`

Same process now with the Vite CLI, I'll start with the
`npm init vite@next` command and give it a name
`vite-tailwind-svelte`.

```bash
npm init svelte@next vite-tailwind-svelte
```

I'll choose the following options from the CLI:

```bash
? Select a framework: › - Use arrow-keys. Return to submit.
    vanilla
    vue
    react
    preact
    lit
❯   svelte
```

Then `svelte`.

```bash
? Select a variant: › - Use arrow-keys. Return to submit.
❯   svelte
    svelte-ts
```

The instructions from the Vite CLI are pretty much the same as the
Svelte one:

```text
Done. Now run:

  cd vite-tailwind-svelte
  npm install
  npm run dev
```

Once I've checked the project is running with no issues I'll
initialise git to highlight changes in the code:

```bash
git init && git add -A && git commit -m "Initial commit"
```

Now time to add in Tailwind with Svelte Add:

```bash
# kill the dev server if it's still running with Ctrl+c
npx svelte-add@latest tailwindcss
# install the newly configured dependencies
npm i
```

Now I can make the changes in the index page which in this project is
located `src/App.svelte`.

Again removing the `<style>` from the page, here's the git diff of
that:

```git
<script>
  import logo from './assets/svelte.png'
  import Counter from './lib/Counter.svelte'
</script>

<main>
  <img src={logo} alt="Svelte Logo" />
  <h1>Hello world!</h1>

  <Counter />

  <p>
    Visit <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte
    apps.
  </p>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme">SvelteKit</a> for
    the officially supported framework, also powered by Vite!
  </p>
</main>

-<style>
-  :root {
-    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
-      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
-  }
-
-  main {
-    text-align: center;
-    padding: 1em;
-    margin: 0 auto;
-  }
-
-  img {
-    height: 16rem;
-    width: 16rem;
-  }
-
-  h1 {
-    color: #ff3e00;
-    text-transform: uppercase;
-    font-size: 4rem;
-    font-weight: 100;
-    line-height: 1.1;
-    margin: 2rem auto;
-    max-width: 14rem;
-  }
-
-  p {
-    max-width: 14rem;
-    margin: 1rem auto;
-    line-height: 1.35;
-  }
-
-  @media (min-width: 480px) {
-    h1 {
-      max-width: none;
-    }
-
-    p {
-      max-width: none;
-    }
-  }
-</style>
```

Then adding in the Tailwind classes to the HTML elements:

```git
<script>
  import logo from "./assets/svelte.png";
  import Counter from "./lib/Counter.svelte";
</script>

+<main class="m-auto text-center p-4">
+  <img class="m-auto h-64 w-64" src={logo} alt="Svelte Logo" />
+  <h1
+    class="font-thin mx-auto max-w-none my-8 text-[#ff3e00] text-6xl uppercase md:max-w-56 md:leading-5"
+  >
    Hello world!
  </h1>

  <Counter />

+  <p class="mx-auto max-w-none my-4 max-w-56 md:leading-5">
    Visit <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte
    apps.
  </p>

+  <p class="mx-auto max-w-none my-4 max-w-56 md:leading-5">
    Check out <a
+      class="underline underline-dark-500"
      href="https://github.com/sveltejs/kit#readme">SvelteKit</a
    > for the officially supported framework, also powered by Vite!
  </p>
</main>
```

Done.

## Conclusion

I've created a couple of example projects using the `npm init` command
for both Vite and Svelte. Added in Tailwind support using [Svelte Add]
and replaced the index page styles on each with Tailwind styles.

<!-- Links -->

[svelte add]: https://github.com/svelte-add/svelte-add

<!-- Images -->

[changes-after-svelte-add-tailwind]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1641143473/scottspence.com/changes-after-svelte-add-tailwind.png
