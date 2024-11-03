---
date: 2021-05-20
title: Data Binding in Svelte
tags: ['svelte', 'sveltekit']
is_private: false
---

Over the last few weeks, I have been getting familiar with Svelte and
SvelteKit in particular. Coming from a React background there are many
similarities using Svelte and some that are not.

One thing that came up when using Svelte was passing values from a
child to parent component and how that worked. I'm not going to go
into detail on Svelte in particular, more some patterns to use.

As with many things in programming, there are several ways to do any
one thing, in this post I'll go over some of the approaches I have
used and when to use them.

I've created examples of these in the Svelte [REPL] so you can have a
play around with them to familiarise yourself with them. I'd also
recommend checking out the Svelte documentation; it's an awesome
source of information.

First up, it might be important to talk about props (short for
properties) and how they are passed between components.

## Passing props down to a child

So here's a super simple `App.svelte` (parent) that is importing the
child component and passing a value, (in this case) `propValue` down
to a `<Child />` component:

```html
<!-- App.svelte -->
<script>
  import Child from './Child.svelte'
</script>

<Child propValue="Pass this to the child!" />
```

Much the same way as you would want to define a variable in React if
the variable is scoped to the component then it's defined there.

Svelte is a superset of HTML with the `.svelte` extension so whereas
in React a prop would be brought in as a parameter in the case of
Svelte it's defined in script tags and exported. This means that the
variable can be wrapped in some curly boys `{}` in the markup (HTML)
so it can be interpreted and read out by JavaScript.

```html
<!-- Child.svelte -->
<script>
  export let propValue
</script>

<p>I'm taking this from the parent: {propValue}</p>
```

But what's this `export`? I struggled with this initially, ultimately
it's a way to make `propValue` available to the parent. If you think
that's weird, just wait until I detail reactive declarations! More on
that soon.

## Passing props back to a parent

As a general rule data flow goes from the parent to the child but what
if you want to pass a value back from the child to the parent?

### Using `bind:value`

In Svelte using the `bind:value` directive (command) to, a'hem bind
the value of the text input to a variable `value`, this is the
shortest example:

```html
<!-- Input.svelte -->
<script>
  let value = ''
</script>

<input bind:value />

<p>{value}!</p>
```

Although `value` isn't a great variable name so it can be changed
further:

```html
<!-- Input.svelte -->
<script>
  let descriptiveVariableName = ''
</script>

<input bind:value="{descriptiveVariableName}" />

<p>{descriptiveVariableName}</p>
```

There's a drawback with doing it this way which I'll come onto in a
bit. For now, I have the data bound to that input, and changing the
text will update the `p` tag with what is added to the text input.

Ok, now I'm treating that input as its own component so, say I want to
access the input value from a parent? "How to pass the bound value
back up to the parent?" I'm going to go back to the previous example
with the less descriptive variable name now and remove the `p` tag as
I want to display the value in the parent, I'm also going to rename it
from `Input.svelte` to `Child.svelte`:

```html
<!-- Child.svelte -->
<script>
  export let value = ''
</script>

<input bind:value />
```

I can now access the bound value of `Child.svelte` by defining a
variable in the parent (`App.svelte`) component, `inputValue` in this
case and pass that to the child:

```html
<!-- App.svelte -->
<script>
  import Child from './Child.svelte'
  let inputValue = ''
</script>

<Child bind:value="{inputValue}" />

<p>Input value is: {inputValue}</p>
```

I'm adding `inputValue` to a `p` tag on the parent now to get that
value. Changing the input in the parent now updates the `inputValue`
wrapped in the `p` tag in the parent.

So I'm updating the `Child` component on the parent and getting that
value back in the `inputValue` variable.

Now, I'm going to go back to the input example with the descriptive
variable and try the same:

```html
<!-- Child.svelte -->
<script>
  export let descriptiveVariableName = ''
</script>

<input bind:value="{descriptiveVariableName}" />
```

Now changing the value in the parent doesn't seem to trigger any
changes, but if I add a `<p>` tag to the child and make some changes I
can see that the changes are going from the parent to the child but
aren't coming back to the parent:

```html
<!-- Child.svelte -->
<script>
  export let descriptiveVariableName = ''
</script>

<input bind:value="{descriptiveVariableName}" />

<p>Child received props: {descriptiveVariableName}</p>
```

In summary, you can pass down named props to components but if you
want to pass the props back up to the parent then you'll need to use
`bind:value` alone. Something to keep in mind when taking this
approach.

### Using a callback

This approach will be familiar if you are used to doing this in React
with adding a callback function. Here an `onChange` is defined in the
`Child` for the parent to use:

```html
<!-- Child.svelte -->
<script>
  export let onChange
  let value = ''
  $: onChange(value)
</script>

<input type="text" bind:value />
```

Wait! What's that `$` doing there? That's a _reactive declaration_
which I touched on earlier but didn't give any explanation. This is
how Svelte can keep track of a component's state change, so whenever
`value` is changed it updates `onChange`.

In the parent I can use the `onChange` from the child to update the
parent:

```html
<!-- App.svelte -->
<script>
  import Child from './Child.svelte'
  let inputBoxValue = ''
</script>

<Child onChange={newValue => inputBoxValue = newValue} />

<p>Input box value is: {inputBoxValue}</p>
```

This doesn't have to be bound to the value of an input though; another
way to achieve this could be to do some validation on the input
`on:blur` so that when the user comes out of the input some validation
can happen.

```html
<!-- Child.svelte -->
<script>
  export let value = ''
  export let onBlur
</script>

<input bind:value on:blur="{onBlur}" />
```

So as mentioned previously, with `onBlur` (or whatever you want to
call this function) this can trigger a function in the parent. I've
added a `parentValidation` function to be triggered in this example:

```html
<!-- App.svelte -->
<script>
  import Child from './Child.svelte'
  let inputBoxValue = ''
  const parentValidation = () => {
    // validation here
    alert(inputBoxValue)
  }
</script>

<Child bind:value="{inputBoxValue}" onBlur="{parentValidation}" />

<p>Input box value is: {inputBoxValue}</p>
```

### Event forwarding / dispatching an action

Last up is the event forwarding in Svelte because Svelte doesn't use a
virtual DOM like Vue and React component events don't _[bubble]_.

In this instance, I'm using the `createEventDispatcher` from Svelte to
create a `dispatch` function for use in the child component and giving
it the label `child-blur` and passing the input `value` back with the
dispatcher.

```html
<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  export let value = ''
</script>

<input bind:value on:blur={dispatch("child-blur", value)} />
```

In the parent much like with doing it with a callback but now in place
of the `onBlur` callback I'm using the `on:child-blur` event to
trigger the `parentValidation`:

```html
<!-- App.svelte -->
<script>
  import Child from './Child.svelte'
  let inputBoxValue = ''
  const parentValidation = ({ detail }) => {
    // validation here
    alert(detail)
  }
</script>

<Child
  bind:value="{inputBoxValue}"
  on:child-blur="{parentValidation}"
/>

<p>Input box value is: {inputBoxValue}</p>
```

I'd say as a project grows then this method will be the goto with a
little boilerplate and a lot of flexibility.

## Conclusion

As I said at the beginning, there are a few ways to do this, and
depending on your use case there may be a need to use any of these
approaches.

I hope you found it useful and that I helped identify some of the
bumps you may come across when doing this for yourself.

## Resources

I've added all the example code here to the [Svelte.dev] [REPL] so you
can play around with them if you're so inclined:

- [Passing props down to a child]
- [Using `bind:value`]
- [Using a callback]
- [Event forwarding / dispatching an action]

[repl]: https://svelte.dev/repl/
[svelte.dev]: https://svelte.dev/
[bubble]:
  https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling_and_capture
[passing props down to a child]:
  https://svelte.dev/repl/b350218ccfa146fca65e766f05dfd235?version=3.38.2
[using `bind:value`]:
  https://svelte.dev/repl/116ab042341d48bda2232eae2b6f41a6?version=3
[using a callback]:
  https://svelte.dev/repl/5f4a327999cd49e5a79e91f6fbe994c8?version=3
[event forwarding / dispatching an action]:
  https://svelte.dev/repl/47e44c5f8fd648a586333d953260664d?version=3
