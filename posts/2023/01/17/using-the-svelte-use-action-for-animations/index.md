---
date: 2023-01-17
title: Using the Svelte use action for animations
tags: ['svelte', 'css', 'animation']
isPrivate: true
---

I did what I usually do and made a useless project! I was searching
for HTTP codes and went to httpcodes.com to see if anyone had done
anything there and it looks like it's parked. This made me think
though, "what about [httpcodes.dev](https://www.httpcodes.dev)?"

So, yeah, I own that domain now and I've just jacked the HTTP response
status codes from the [MDN Web Docs]. **But why?** Look I just wanted
to have a list of searchable HTTP response codes! 😅 Ok, so what's
using the [Svelte use action] got to do with this?

First up! Sorry if you're on a slow internet connection! This image is
a whopper! But it explains what I wanted to acheive!

[![http-codes-dev-accordion-animation]]
[http-codes-dev-accordion-animation]

That nice smooth open close transition! So that isn't a `<details>`
and `<summary>` tags like this.

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

Another good example and use case for using the Svelte `use:` is for a
click outside action. So this could be for a shopping cart or a
settings panel. I implemented this on the Vendure storefront demo I
did.

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

<!-- Links -->

[MDN Web Docs]:
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
[Svelte use action]:
  https://svelte.dev/docs#template-syntax-element-directives-use-action

<!-- Images -->

[http-codes-dev-accordion-animation]:
  https://res.cloudinary.com/defkmsrpw/video/upload/f_webp,fl_animated,fl_awebp/e_loop/v1674149984/scottspence.com/http-codes-dev-accordion-animation.mp4
