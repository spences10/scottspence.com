---
date: 2023-03-30
title: SvelteKit Data Loading, Understanding the load function
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: true
---

<script>
  import { Banner, DateDistance as DD, Details } from '$lib/components'

  const skeleton_info = {
    type: 'info',
    message: `The SvelteKit skeleton project is one of the CLI options 
      when you create a new SvelteKit project with the <code>pnpm create
      svelte</code> command.`,
  }
</script>

During a workshop I was hosting at CityJS (<DD date="2023-03-29"/>
ago) for getting started with Svelte and SvelteKit, I received some
valuable feedback from an attendee who was unclear about the role of
the load function in SvelteKit.

This prompted me to revisit this topic and provide a more in-depth
explanation for developers new to SvelteKit. In this post, I'll focus
on understanding the load function in SvelteKit and how it's used.

So, to do that, first I'm going to need to explain routing and the
file notation in SvelteKit. 😅

## Routing in SvelteKit

In SvelteKit, the `+` file notation is used to indicate that a file is
part of a route. If I take a look at the `src/routes` directory in the
SvelteKit skeleton it looks like this:

```text
└── +page.svelte
```

So, in the example above, running the dev server (`pnpm run dev`) and
visiting `localhost:5173` will render the `+page.svelte` file.

<Banner options={skeleton_info} />

Each route can have _one_ or _many_ of the following files:

```text
+page.svelte
+page.ts
+page.server.ts
+layout.svelte
+layout.ts
+layout.server.ts
+error.svelte
+server.ts
```

At a high level, here's a summary of what each file does:

- `+page.svelte`: represents a page, it is a standalone file that will
  be rendered when the corresponding route is accessed.
- `+page.ts`: a module that exports a `load` function that fetches
  data for a page.
- `+page.server.ts`: exports `load` function that will be run on the
  server.
- `+layout.svelte`: a layout component that wraps multiple pages,
  allowing you to share components across pages.
- `+layout.ts`: a module that exports a `load` function that fetches
  data for the layout component. This data is available to all child
  pages.
- `+layout.server.ts`: exports `load` function that will be run on the
  server.
- `+error.svelte`: a special page that is rendered when an error
  occurs during loading or rendering of a page.
- `+server.ts`: used to define custom API routes (endpoints) that
  handle HTTP requests.

I'll dig into these more in the following sections.

This is a basic idea of what the file notation in SvelteKit is used
for, I'll also take a look at component props (short for properties)
in SvelteKit.

## Component props

In Svelte components, `export let` is used to declare a variable as a
prop, which allows it to receive data from a parent component.

In the following example, the `name` prop is declared and set to
`World` by default.

```html
<script>
  export let name = 'World'
</script>

<p>Hello, {name}!</p>
```

In the parent, be that a Svelte component or a SvelteKit
`+page.svelte` route, the `name` prop can be set to a different value.

```html
<script>
  import Greeting from './Greeting.svelte'
</script>

<Greeting name="Svelte" />
```

Why `export let` though?

I'll refer to the [MDN reference for `export`] which states:

> The export declaration is used to export values from a JavaScript
> module. Exported values can then be imported into other programs
> with the import declaration or dynamic import. The value of an
> imported binding is subject to change in the module that exports it
> — when a module updates the value of a binding that it exports, the
> update will be visible in its imported value.

In essence this ensures that when a component prop changes it will
update the value of the prop in the parent component.

This also enables two-way binding, which is a feature of Svelte. More
on that in the [Data Binding in Svelte] post I did a few years back.

## Adding additional routes

If I wanted to add a route for `/about`, I'd need to create a
directory (or folder) with a `+page.svelte` file in that directory.

I can do this with a bash command like this:

```bash
mkdir src/routes/about
touch src/routes/about/+page.svelte
```

The folder structure would look like this now:

```text
├── about/
│   └── +page.svelte
└── +page.svelte
```

In the `src/routes/about/+page.svelte` file, I can add some content to
render.

```html
<h1>This is the about page</h1>
```

Now, if I visit `localhost:5173/about`, I'll see the `+page.svelte`
for the about route.

## Data loading

Now that I've detailed routing and component props in SvelteKit, I can
explain how the `load` function is used.

If I wanted to load some data for the about page, I could create a
`+page.ts` file alongside the `+page.svelte` file in the `/about`
folder.

```bash
touch src/routes/about/+page.ts
```

Now there's an associated `+page.ts` file for the `+page.svelte` file:

```text
├── about/
│   ├── +page.svelte
│   └── +page.ts
└── +page.svelte
```

This is a contrived example, but say in that file, if I want to get
some data (from an external source later) I can use the SvelteKit
`load` function that will return that data to be used in the
`+page.svelte` file.

I'll make a simplified example for now and just return an object with
a title property in the `src/routes/about/+page.ts` file:

```ts
export const load = () => {
  return {
    title: 'This data is from the load function',
  }
}
```

In SvelteKit, the `+page.svelte` file is a Svelte component, so it can
also receive props. The `data` prop is reserved in SvelteKit routes to
receive the data from a `load` function.

In the `src/routes/about/+page.svelte` file, I can receive the `data`
prop and use it in the page.

I can just log out the data into a `<pre>` tag for now to see the
data:

```html
<script lang="ts">
  export let data
</script>

<h1>This is the about page</h1>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

Then I can use the data in the page and access the `title` property:

```html
<script lang="ts">
  export let data
</script>

<h1>This is the about page</h1>

<p>{data.title}</p>
```

So, yes, a super simple example which I hope help illustrate how the
`load` function works in SvelteKit.

## Go deeper, practical examples

Ok, now onto some practical examples of using the `load` function.

So the most common use case for the `load` function is to fetch data
from an external source, like an API.

In the following sections I'll go through some examples of fetching
data from an API on the server and client.

## Fetching data from external sources

<!-- Links -->

[MDN reference for `export`]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
[Data Binding in Svelte]:
  https://scottspence.com/posts/data-binding-in-svelte
