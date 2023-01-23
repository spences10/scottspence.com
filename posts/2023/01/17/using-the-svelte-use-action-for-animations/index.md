---
date: 2023-01-17
title: Using the Svelte use action for animations
tags: ['svelte', 'css', 'animation']
isPrivate: true
---

<script>
  import Sarcasm from '$lib/components/sarcasm.svelte'
  import Details from './details.svelte'
</script>

I did what I usually do and made a useless project! I was searching
for HTTP codes and went to httpcodes.com to see if anyone had done
anything there and it looks like it's parked. This made me think
though, "what about [httpcodes.dev](https://www.httpcodes.dev)?"

So, yeah, I own that domain now and I've just jacked the HTTP response
status codes from the [MDN Web Docs] and put them into a searchable
page. **But why?** Look I just wanted to have a list of searchable
HTTP response codes! 😅 Ok, so what's using the [Svelte use action]
got to do with this?

First up! Sorry if you're on a slow internet connection! This image is
a whopper! But it explains what I wanted to acheive!

[![http-codes-dev-accordion-animation]]
[http-codes-dev-accordion-animation]

That nice smooth open close transition!

There's many ways to do this, here's a couple I found when writing
this.

## Using details and summary

The OG way to do this is to use the HTML `details` and `summary`, this
is coded right into the Markdown here:

<details class='border'>
  <summary style='padding: 0 20px;'>
    HTTP response status codes indicate whether a specific HTTP
    request has been successfully completed. Responses are grouped
    in five classes:
  </summary>
  <ol class="list-decimal px-20">
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li class="pb-5">Server error responses (500 - 599)</li>
  </ol>
</details>

The good thing with this is that the content is on the page and
searchable by the search engines. The bad thing is that it's not
animated.

Yes, there are ways to animate the HTML details tag but they all felt
a bit janky. Check out this [stackoverflow answer] for some examples.

## Svelte transition then! Maybe??

Aight! I'll use a Svelte transition! I'll use the `slide` transition
to, you know, slide it out!

So this is the component:

```svelte
<script>
  import { slide } from 'svelte/transition'
  export let buttonText = ''
  export let isOpen = false
</script>

<div class="border">
  <button on:click={() => (isOpen = !isOpen)}>
    {buttonText}
  </button>
  {#if isOpen}
    <div transition:slide>
      <slot />
    </div>
  {/if}
</div>
```

Then it's used like this:

```svelte
<Details
  class='border'
  buttonText={`HTTP response status codes indicate whether a specific HTTP
    request has been successfully completed. Responses are grouped
    in five classes:`}
>
  <ol class="list-decimal px-20">
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li class="pb-5">Server error responses (500 - 599)</li>
  </ol>
</Details>
```

And I get a result something like this:

<Details 
  class='border'
  buttonText={`HTTP response status codes indicate whether a specific HTTP
    request has been successfully completed. Responses are grouped
    in five classes:`}
>
  <ol class="list-decimal px-20">
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li class="pb-5">Server error responses (500 - 599)</li>
  </ol>
</Details>

Not too shabby, but do you notice at the very end of the transition?
It sort of snaps out to the full height of the content.

This is because the content is not in the DOM until the transition
starts with the `on:click` then the conditional `#if` will add the
content to the DOM.

This also this means that the content is not searchable by the search
engines unless the details component `isOpen` is se to `true`.

## JavaScript to the rescue!

With the Svelte use action you get access to the DOM node the action
is attached to and you can also pass in additional parameters.

## Click outside

Another good example and use case for using the Svelte `use:` is for a
click outside action. So this could be for a shopping cart or a
settings panel. I implemented this on the [Vendure storefront demo] I
did a while back now.

Here's the action:

```ts
// https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7
/** Dispatch event on click outside of node */
export const clickOutside = (node: any) => {
  const handleClick = (event: any) => {
    if (
      node &&
      !node.contains(event.target) &&
      !event.defaultPrevented
    ) {
      node.dispatchEvent(new CustomEvent('click_outside', node))
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}
```

Then it's implemented like this:

```svelte
<script lang="ts">
  import { clickOutside } from '$lib/utils'
  import { cartOpen } from '$stores/cart'
  import { fly } from 'svelte/transition'

  const handleClickOutside = () => {
    $cartOpen = !$cartOpen
  }
</script>

{#if $cartOpen}
  <section
    use:clickOutside
    on:click_outside={handleClickOutside}
    in:fly={{ x: 200, duration: 150 }}
    out:fly={{ x: 400, duration: 150 }}
  >
    <div>
      <button
        on:click={() => {
          $cartOpen = !$cartOpen
        }}
      >
        &#10799;
      </button>
      <p>Cart</p>
    </div>
  </section>
{/if}
```

If you want to see the code you can check out the [SvelteKit Vendure
commerce] demo over on GitHub.

## Sarcasm

I also revivied the Sarcasm component on this blog after a long time
of it not functioning after I moved the site from an MDX based blog
over to Svelte.

```svelte
<script>
  let children = ''

  const sarky = node => {
    children = node.childNodes[0].nodeValue

    node.childNodes[0].nodeValue = children
      .split('')
      .map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
      .join('')
  }
</script>

<span class="font-semibold" use:sarky>
  <slot />
</span>
```

Implementation:

```markdown
<script>
  import Sarcasm from '$lib/components/sarcasm.svelte'
</script>

<Sarcasm>I made a useless project!</Sarcasm>
```

Result: <Sarcasm>made a useless project!</Sarcasm>

## Conclusion

Several uses for the Svelte `use:` action. I'm sure there are a ton
more (a'hem) `:use`'s for it as well!

<!-- Links -->

[MDN Web Docs]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
[Svelte use action]:
  https://svelte.dev/docs#template-syntax-element-directives-use-action
[vendure storefront demo]:
  https://sveltekit-vendure-commerce.vercel.app/
[SvelteKit Vendure commerce]:
  https://github.com/spences10/sveltekit-vendure-commerce
[stackoverflow answer]: https://stackoverflow.com/a/38215801

<!-- Images -->

[http-codes-dev-accordion-animation]:
  https://res.cloudinary.com/defkmsrpw/video/upload/f_webp,fl_animated,fl_awebp/e_loop/v1674149984/scottspence.com/http-codes-dev-accordion-animation.mp4
