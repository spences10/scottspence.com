---
date: 2023-01-17
title: Using the Svelte use action for animations
tags: ['svelte', 'css', 'animation']
isPrivate: false
---

<script>
  import Sarcasm from '$lib/components/sarcasm.svelte'
  import DetailsTransition from './details-transition.svelte'
  import DetailsAction from './details-action.svelte'
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

Example code:

```html
<details>
  <summary>
    HTTP response status codes indicate whether a specific HTTP
    request has been successfully completed. Responses are grouped in
    five classes:
  </summary>
  <ol>
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li>Server error responses (500 - 599)</li>
  </ol>
</details>
```

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
  export let open = false
</script>

<section class="border">
  <button
    on:click={() => {
      open = !open
    }}
  >
    <div class="flex items-center text-left">
      <span style="margin:0 1rem;" class="transition" class:open>
        ▶
      </span>
      <p>{buttonText}</p>
    </div>
  </button>
  {#if open}
    <div transition:slide class="prose-ol:pl-20">
      <slot />
    </div>
  {/if}
</section>

<style>
  .open {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
```

I use Tailwind CSS for the styling, but you can see that I'm using the
`open` class to rotate the triangle.

Then it's used like this:

```svelte
<DetailsTransition
  buttonText={`HTTP response status codes indicate whether a specific HTTP
    request has been successfully completed. Responses are grouped
    in five classes:`}
>
  <ol>
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li>Server error responses (500 - 599)</li>
  </ol>
</DetailsTransition>
```

And I get a result something like this:

<DetailsTransition
buttonText={`HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:`}>

  <ol style='list-style-type: decimal;padding-left:80px;margin:1rem 0'>
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li>Server error responses (500 - 599)</li>
  </ol>
</DetailsTransition>

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

So in the case of what I'm trying to acheive here, I want to be able
to pass in if the details component is open or not. That's controlled
by the button in the component.

In the component script tags I'll create the action that will take in
the DOM node and pass in the `open` variable, for now I'll log out the
contents of the node and the open variable, I'll attach the slide
action to the div wrapping the slot. The node that gets passed into
the action is the element that has the `use:` added to it.

```svelte
<script>
  export let buttonText = ''
  export let open = false

  // custom slide animation
  const slide = (node, open) => {
    console.log('node', node)
    console.log('open', open)
  }
</script>

<button
  on:click={() => {
    open = !open
  }}
>
  <div>
    <p>{buttonText}</p>
  </div>
</button>

<div use:slide={open} >
  <slot />
</div>
```

So from here I can set some initial defaults for the node.

```svelte
<script>
  export let buttonText = ''
  export let open = false

  // custom slide animation
  const slide = (node, open) => {
    node.style.height = open ? `auto` : '0px'
    node.style.overflow = 'hidden'
  }
</script>
```

With the `use:` action it can return a couple of lifecycle methods
`destroy` and `update`.

I can use the `update` method to respond to the button being pressed.

```js
const slide = (node, open) => {
  let initialHeight = node.offsetHeight
  node.style.height = open ? `auto` : '0px'
  node.style.overflow = 'hidden'

  return {
    update: open => {
      node.style.height = open ? `auto` : '0px'
    },
  }
}
```

So that's cool! Looking at the component now I'm basically back to
where I was with the `details` tag. It'll just snap out to the full
height of the content.

## Using the Web Animations API

So I want to use the Web Animations API to animate the height of the
content.

The [Web Animations API] takes in two parameters, `keyframes` and
`options`. The `keyframes` is an array of objects that define the
animation. In this case I want to animate the `height` of the node
from `0px` to the initial height of the node.

I'll get the initial height of the node by using `node.offsetHeight`
and wang that into a variable and I can use that in the `keyframes`
array.

```js
let initialHeight = node.offsetHeight
node.style.height = open ? `auto` : '0px'
node.style.overflow = 'hidden'
let animation = node.animate(
  [{ height: '0px' }, { height: `${initialHeight}px` }],
```

The `options` is an object that defines the duration and timing of the
animation. There's more detail on the MDN docs for the
[`KeyframeEffect()` constructor].

What I want to add in for the options is the `duration` and the
`easing` function along with the `fill` property and the `direction`.

The direction will map to the `open` variable that I'm passing in. So
if the `open` variable is `true` then I want the animation to reverse,
if it's `false` then I want the animation to play normally.

```js
const slide = (node, open) => {
  let initialHeight = node.offsetHeight
  node.style.height = open ? `auto` : '0px'
  node.style.overflow = 'hidden'
  let animation = node.animate(
    [{ height: '0px' }, { height: `${initialHeight}px` }],
    {
      duration: 200,
      easing: 'ease-in-out',
      fill: 'both',
      direction: open ? 'reverse' : 'normal',
    }
  )
```

So, refreshing the page the component is on now will immediately play
the animation. So the component is in it's expanded state.

I can use instance method `.pause()` to pause the animation. So when
the page refreshes it's in its initial closed state. Clicking the
button will play the animation. There's some weird behaviour now,
clicking again it expands out then back in again.

So I need a way to work out if the animation is playing or not.
There's a `onfinish` method on the animation I can use a function to
get the `currentTime` of the animation and if it's `0` then the
animation is paused.

```js
animation.onfinish = () => {
  if (animation.currentTime === 0) {
    animation.pause()
  }
}
```

I could go a step further here and destructure the `currentTime`
property from the animation object and I should also set the animation
to reverse before it's paused!

```js
animation.onfinish = ({ currentTime }) => {
  if (currentTime === 0) {
    animation.reverse()
    animation.pause()
  }
}
```

Then rather than checking if the `open` variable is `true` or `false`
I can use the `currentTime` property to check if the animation is
playing or not and either reverse it or play it.

```js
return {
  update: () => {
    animation.currentTime ? animation.reverse() : animation.play()
  },
}
```

So, with that all being said, here's the full component:

```svelte
<script>
  export let buttonText = ''
  export let open = false

  // custom slide animation
  const slide = (node, open) => {
    let initialHeight = node.offsetHeight
    node.style.height = open ? `auto` : '0px'
    node.style.overflow = 'hidden'
    let animation = node.animate(
      [{ height: '0px' }, { height: `${initialHeight}px` }],
      {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'both',
        direction: open ? 'reverse' : 'normal',
      }
    )
    animation.pause()
    animation.onfinish = ({ currentTime }) => {
      if (currentTime === 0) {
        animation.reverse()
        animation.pause()
      }
    }
    return {
      update: () => {
        animation.currentTime ? animation.reverse() : animation.play()
      },
    }
  }
</script>

<section>
  <button
    on:click={() => {
      open = !open
    }}
  >
    <div>
      <span class="transition" class:open>
        ▶
      </span>
      <p>{buttonText}</p>
    </div>
  </button>
  <div use:slide={open}>
    <slot />
  </div>
</section>

<style>
  .open {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
```

And here it is in action:

<DetailsAction
buttonText={`HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:`}>

  <ol style='list-style-type:decimal;padding-left:80px;'>
    <li>Informational responses (100 - 199)</li>
    <li>Successful responses (200 - 299)</li>
    <li>Redirection messages (300 - 399)</li>
    <li>Client error responses (400 - 499)</li>
    <li style='padding-bottom:20px'>Server error responses (500 - 599)</li>
  </ol>
</DetailsAction>

Another thing that could be done here is to add a custom event to the
element with the `use:` action on it.

So, in the `animation.onfinish` event add in my custom event.

```js
animation.onfinish = ({ currentTime }) => {
  if (currentTime === 0) {
    animation.reverse()
    animation.pause()
  }
  node.dispatchEvent(new CustomEvent('animationEnd'))
}
```

Then on the element that has the `use:` action on it I can listen for
the event and then do something with it.

```svelte
<div
  use:slide={open}
  on:animationEnd={() => {
    // do something
  }}
>
  <slot />
</div>
```

## What about a11y?

Semantic HTML is important, so I'm not going to say that you should
never use the HTML `details` and `summary` tags.

In this case I wanted the nice animation so to assist users that use
screen readers I added some additional aria attributes to the button
and to the div that wraps the slot.

I've removed the script information and styles for brevity.

I got the pointers on this from the [A11Y Style Guide]. Just bear in
mind that some of the information given to the component here can be
done via props.

```svelte
<section>
  <button
    aria-controls="accordion__content_2"
    aria-expanded={open}
    tabindex="0"
    id="accordion__title_2"
    on:click={() => {
      open = !open
    }}
  >
    <p>{buttonText}</p>
  </button>
  <div
    use:slide={open}
    id="accordion__content_2"
    role="region"
    aria-hidden={!open}
    aria-labelledby="accordion__title_2"
  >
    <slot />
  </div>
</section>
```

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

It uses a simple store to keep track of the cart open state:

```ts
import { writable } from 'svelte/store'

export const cartOpen = writable(false)
```

If you want to see the code you can check out the [SvelteKit Vendure
commerce] demo over on GitHub.

## Sarcasm

I also revivied the Sarcasm component on this blog after a long time
of it not functioning after I moved the site from an MDX based blog
over to Svelte.

This isn't using animations or transitions, but it's a good example of
how you can use the Svelte `use:` action to manipulate the DOM.

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
more (a'hem) `use:`'s for it as well!

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
[a11y style guide]:
  https://a11y-style-guide.com/style-guide/section-navigation.html
[Web Animations API]:
  https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
[`KeyframeEffect()` constructor]:
  https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#parameters

<!-- Images -->

[http-codes-dev-accordion-animation]:
  https://res.cloudinary.com/defkmsrpw/video/upload/f_webp,fl_animated,fl_awebp/e_loop/v1674149984/scottspence.com/http-codes-dev-accordion-animation.mp4
