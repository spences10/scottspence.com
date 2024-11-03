---
date: 2021-04-06
title: Notes on Svelte
tags: ['notes', 'svelte']
isPrivate: false
---

I had a play around with Svelte the other day and wanted to make a few
notes and comparisons to React, React being a point of reference for
me and hopefully others.

I've found a lot of the examples here on [Svelte Mastery]

There's also the Svelte docs with [interactive tutorials] which I'm going
through.

As Svelte looks really similar to html styling is done pretty much the
same way.

Want to add functionality add `script` tags want to add style add
`style` tags.

A simple Svelte component could look something like this:

```html
<!-- Simple component -->
<!-- Circle.svelte -->
<script>
	// use export so that text can be accepted as a prop
	export let text = 'hello world'
</script>

<div>{text}</div>

<style>
	div {
		height: 200px;
		width: 200px;
		margin: 20px;
		font-size: 2rem;
		background-color: #663399;
		color: #fff;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
```

Then that can be used by `App.svelte` like this:

```html
<!-- App.svelte -->
<script>
	import Circle from './Circle.svelte'
</script>

<main>
	<Circle />
</main>
```

In the component I defined the prop with `export let text` which is
defaulted to `hello world` but I can pass in my own prop to the
`Circle` component to replace it!

```html
<!-- App.svelte -->
<script>
	import Circle from './Circle.svelte'
</script>

<main>
	<Circle text="wheeeeee" />
</main>
```

<!-- cSpell:ignore wheeeeee -->

## Styling

Each components styles are scoped so if I want to import a goat image
as a component:

```html
<!-- App.svelte -->
<script>
	import Goat from './Goat.svelte'
</script>

<main>
	<Goat />
</main>
```

The `Goat` component is an image tag with some styles scoped to it:

```html
<!-- Goat.svelte -->
<img
	alt="adorable goat"
	src="https://images.unsplash.com/photo-1533318087102-b3ad366ed041"
/>

<style>
	img {
		height: 200px;
	}
</style>
```

The styles in the component are scoped so if there's any styles that
need to be applied in the parent (`App.svelte`) then then all that can
be affected is the wrapping element for it:

```html
<script>
	import Goat from './Goat.svelte'
</script>

<!-- This only affects the wrapping div -->
<main>
	<div class="goat-wrapper">
		<Goat />
	</div>
</main>

<style>
	.goat-wrapper {
		height: 400px;
		background-color: cornflowerblue;
	}
</style>
```

There is a `global` directive that you can use this will target
anything in the class matching that element:

```html {17-19}
<script>
	import Goat from './Goat.svelte'
</script>

<!-- This only affects the wrapping div -->
<main>
	<div class="goat-wrapper">
		<Goat />
	</div>
</main>

<style>
	.goat-wrapper {
		height: 400px;
		background-color: cornflowerblue;
	}
	.goat-wrapper :global(img) {
		height: 400px;
	}
</style>
```

## Slots

You can nest other elements in a component with a `slot` a slot is
much like the `children` prop in React.

If I take the `Circle` component and add a `slot` to it:

```html {1}
<div><slot /></div>

<style>
	div {
		overflow: hidden;
		height: 200px;
		width: 200px;
		margin: 20px;
		font-size: 2rem;
		background-color: #663399;
		color: #fff;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
```

Then I can nest other components in it:

```html {10}
<script>
	import Circle from './Circle.svelte'
	import Goat from './Goat.svelte'
</script>

<main>
	<div class="goat-wrapper">
		<Goat />
		<Circle>
			<Goat />
		</Circle>
	</div>
</main>

<style>
	.goat-wrapper {
		height: 400px;
		background-color: cornflowerblue;
	}
	.goat-wrapper :global(img) {
		height: 400px;
	}
</style>
```

## Event handlers

The `on:click` is used pretty much the same as with React. Here I'm
cycling through some goat pics on click:

```html
<script>
	const goats = [
		`https://images.unsplash.com/photo-1533318087102-b3ad366ed041`,
		`https://images.unsplash.com/photo-1585082868368-58be13852617`,
		`https://images.unsplash.com/photo-1540392015439-4cc83fc3c1cf`,
	]
	export let goatsIndex = 0
	export function nextGoat() {
		if (goatsIndex + 1 === goats.length) goatsIndex = 0
		goatsIndex += 1
	}
</script>

<img alt="adorable goat" src="{goats[goatsIndex]}" />
<button on:click="{nextGoat}">Next Goat</button>
<!-- Alternatively to pass the event to the function -->
<!-- <button on:click={(e) => nextGoat(e)}>Next Goat</button> -->
<style>
	img {
		height: 200px;
	}
</style>
```

## Conditional render (if blocks)

Conditional rendering in Svelte is a bit different to React whereas in
React I'd break out into JavaScript in Svelte there's a special
notation used.

```html
<script>
	import Goat from './Goat.svelte'
	import Sloth from './Sloth.svelte'

	let animal = 'sloth'
</script>

<main>
	{#if animal === "sloth"}
	<Sloth />
	{:else if animal === "goat"}
	<Goat />
	{:else} No animal {/if}
</main>
```

## HTML for loop

Looping over arrays is done with the `#each` directive with similar
format to the `#if` directive.

```html
<script>
	const cats = [{ name: `Boris` }, { name: `Leo` }, { name: `Darcy` }]
</script>

<main>
	{#each cats as cat}
	<div>{cat.name}</div>
	{/each}
</main>
```

## Context

Context in Svelte is simpler than with React, in React to define some
context you'd need to create context provider which would then need to
live high up in the render tree (`app.js`) along with the other
providers.

In Svelte you pull out the `setContext` function from Svelte then give
that context a key and what you want to set that key to.

Check out the `App.svelte` example here:

```html
<script>
	import { setContext } from 'svelte'
	import Goat from './Goat.svelte'
	import Sloth from './Sloth.svelte'

	setContext('sloth', incrementSloth)

	let slothCount = 0
	function incrementSloth() {
		slothCount++
	}
</script>

<main>
	<Sloth {slothCount} />
	<Goat />
</main>
```

Then in `Sloth.svelte` use `getContext` to use the `incrementSloth`
function from `App.svelte`:

```html
<script>
	import { getContext } from 'svelte'

	let incrementSloth = getContext('sloth')
	export let slothCount
</script>

<img
	alt="adorable sloth"
	src="https://images.unsplash.com/photo-1576612119302-7b7e8f824e5f"
/>

{slothCount}
<button on:click="{incrementSloth}">Bump Sloth</button>

<style>
	img {
		height: 200px;
	}
</style>
```

## Reactivity

This is where a lot of people get their knickers in a twist with
Svelte and to be honest I'm fine with it.

Svelte uses the JavaScript label statement for when you want to change
a components state when it's created from the state of another
component.

Here's the example take from the [Svelte.dev tutorial site]:

```html
<script>
	let count = 0
	$: doubled = count * 2

	function handleClick() {
		count += 1
	}
</script>

<button on:click="{handleClick}">
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<p>{count} doubled is {doubled}</p>
```

## Use state hooks

Take a look at the following example from the React documentation for
[Introducing Hooks] which is a simple counter component:

```jsx
import React, { useState } from 'react'

function Example() {
	// Declare a new state variable, which we'll call "count"
	const [count, setCount] = useState(0)

	return (
		<div>
			<p>You clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click me</button>
		</div>
	)
}
```

Now take a look at the same example in Svelte:

```html
<script>
	let count = 0
</script>

<p>You clicked {count} times</p>
<button on:click="{()" ="">count++}> Click me</button>
```

They both do the same thing and the Svelte one is a little shorter and
a lot simpler to grok.

## Resources

Check out [Svelte Mastery] for all these examples and more

[interactive tutorials]: https://svelte.dev/tutorial/basics
[svelte mastery]:
	https://www.youtube.com/channel/UCg6SQd5jnWo5Y70rZD9SQFA
[svelte.dev tutorial site]:
	https://svelte.dev/tutorial/reactive-declarations
[introducing hooks]: https://reactjs.org/docs/hooks-intro.html
[svelte mastery]:
	https://www.youtube.com/channel/UCg6SQd5jnWo5Y70rZD9SQFA
