---
date: 2021-11-29
title: Data Fetching in Svelte
tags: ['svelte', 'sveltekit', 'notes']
isPrivate: true
---

Here's an overview of the various ways to fetch data in Svelte. This
was inspired by a conversation I had on the Svelte Discord and goes
into detail on when and where to use each of the different methods.

<!-- Transcript -->

Scott:

So, what's stopping me from from getting data in a Svelte project via
store, endpoint or client?

So, I can make a writable store and get some data from an API, then
that's good, I can get the same data via an endpoint, or via the
client.

How do you get yours?

I mainly use an endpoint, I have used a store for a couple of
projects.

Pngwn:

if I'm not using svelte kit i tend to use a custom 'fetch store', that
will toggle between idle/ pending/ error/ success state (funnily
enough a state machine under the hood).

```js
const fetch = fetch_store(url)
// $fetch.data has the data
```

It looks a bit like:

```ts
interface FetchStoreContents<T> = {
  status: 'idle' | 'pending' | 'success' | 'error'
  data?: T | Error | Whatever;
}
```

Then i can just `{#if $fetch.status === 'pending'}` etc. Kinda simple
but works nicely This would actually be better as a discriminated
union for the TS part, structure same but the types would be
different.

Kev:

I assume you're using SvelteKit since you're talking a bit about
endpoints.

A store would just be on the client, you'd be missing out on SSR. If
you want that the only way is to use endpoints. Doing what @pngwn does
with a fetch store definitely makes sense for parts where you do not
need SSR though And is also what I do 🥳

Scott:

Ok, this is reassuring, for the times I have used stores is for local
stuff so that cool! and good to know the situations for when to use
it.

Like, if you want to render out a list of links from an API and want
them SEOable then this isn't the way to go, if it's for generating
stuff locally, like sending a search query for results in the client
then this is a good time to use a store.

Fair comment?

Tails:

for the fluent svelte docs, I had to turn an array of examples with
string source code to svelte components, then re-import them as JS
modules and for some reason, I just couldn't do that in an endpoint I
usually use endpoints to move data around

Jordan:

In Svelte Kit I usually use `load` for initial page data and if I have
something like a table to filter e.g. users. For everything else I use
a custom function that creates a store and has data, `error` and
`loading` properties.

Kinda like pngwn... So basically everything that submits a form uses a
store fetch function and everything else load for ssr. I'm currently
experimenting with letting my Form component handle the fetch.

I was thinking if you have a Form component that handles the values
and validation you could also let it handle the fetch and do something
like this:

```svelte
<Form action="/orders" method="post" let:loading>
	<button disabled={loading}>Submit</button>
</Form>
```
