---
date: 2023-01-06
title: Instagram Image Filters with Tailwind CSS and SvelteKit
tags: ['css', 'how-to', 'svelte', 'sveltekit']
isPrivate: false
---

Real quick! This was a dumb idea I had when I created the repo for
this in 2018 and never got around to doing anything with until
yesterday! 😂

**Tl;Dr**: It's a list of CSS filters that you can apply to an image
to see what effect they have.

I got the idea from [this repo], which in turn got the idea from [Una
Kravets].

Essentially, it applies the [CSS filter] class to the image using one
of the filters from the [list], like this:

```html
<figure class="filter-1977">
  <img
    src="https://picsum.photos/400/400"
    alt="random picsum asset"
  />
</figure>
```

Rather than list out all the filters, individually I thought I'd add
them to a select element and use Svelte's data binding to apply the
filter to the image.

## The process

So to get the filters [list] into the project, I created a new project
with `pnpm create svelte` then created a `instagram.css` file in the
`src` directory and copied the list into it.

Then I can import the CSS file into the `src/routes/+page.svelte` file
and use the CSS filter class names in a `figure` element.

```svelte
<script>
  import '../instagram.css'
</script>

<figure class="filter-1977">
  <img
    src="https://picsum.photos/400/400"
    alt="random picsum asset"
  />
</figure>
```

Cool! But I want to be able to select the filter from a list. So I
create a `filters.svelte`, `select` component and add the filters to
the `option` element using the Svelte `{each}` loop.

<!-- cSpell:ignore looooong -->

```svelte
<script>
  let filtersList = ['looooong', 'list', 'of', 'filters']
</script>

<select>
  {#each filtersList as filter}
    <option value={filter}>
      <span>{filter}</span>
    </option>
  {/each}
</select>
```

Cool, so, now I have a list of filters, I'll idd that into my
`+page.svelte` and I can choose the filters. Sweet!

```svelte
<script lang="ts">
  import Filters from '$lib/components/filters.svelte'
  import '../instagram.css'
</script>

<figure class="filter-1977">
  <img
    src="https://picsum.photos/400/400"
    alt="random picsum asset"
  />
</figure>

<Filters />
```

Aight, now, I need to apply the filter from the select onto the image,
right?

So, I need to ge the value of the select and apply it to the `figure`,
how do I get the value of the select over to the `+page.svelte`?

By using data binding!

## Bind the select value to a variable

I did a post about [Data Binding in Svelte] a while back if you want
to get a full understanding of what's going on here.

What I need to do is create a variable in the `filters.svelte` file to
bind the value of the select to.

So, essentially `export let value = ''` is the value being passed into
the component.

```svelte
<script>
  let filtersList = ['looooong', 'list', 'of', 'filters']
  export let value = ''
</script>

<select bind:value>
  {#each filtersList as filter}
    <option value={filter}>
      <span>{filter}</span>
    </option>
  {/each}
</select>
```

In the `+page.svelte` file, I can create an `optionValue` variable and
bind that to the `Filters` component.

When the value changes on the page, that value is passed to the
`Filters` component.

I can then apply the `optionValue` to the `figure` element `class`
using some backticks to apply the class.

```svelte
<script lang="ts">
  import Filters from '$lib/components/filters.svelte'
  import '../instagram.css'
  let optionValue = ''
</script>

<figure class={`filter-${optionValue}`}>
  <img src="https://picsum.photos/400/400" alt="" />
</figure>

<Filters bind:value={optionValue} />
```

That's it! Now, when I select a filter from the list, it will apply to
the `figure` element.

## Expanding on the above

There's a little more expansion that could be done here using some
Svelte features.

Say I _do_ actually want to list out all the filters, I can use the
Svelte `{#each}` loop to create a list of `figure` elements and apply
some CSS styles to it.

Underneath where the `Filters` component is imported, I'll create
`div` which I'll apply some CSS grid styles to and loop through all
the filters.

As the filters array is used in more than one place now it makes sense
to abstract that out into its own file and import it where it's
needed.

```svelte
<div class="figure-group">
  {#each filtersList as item}
    <figure class={`styled-figure filter-${item}`}>
      <img
        src="https://picsum.photos/400/400"
        alt="random picsum asset"
      />
      <p>{item}</p>
    </figure>
  {/each}
</div>

<style>
  .styled-figure {
    height: 100%;
  }
  .figure-group {
    margin: 0 auto;
    display: grid;
    gap: 0.5rem;
  }

  @media (min-width: 1000px) {
    .figure-group {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1450px) {
    .figure-group {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
```

I've add in some media queries in the `style` tags there to make the
grid responsive as well.

If you're interested you can check out the code over on [GitHub].

Thanks for reading!

<!-- Links -->

[this repo]: https://github.com/picturepan2/instagram.css
[una kravets]: https://una.im/CSSgram/
[css filter]: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
[list]:
  https://github.com/picturepan2/instagram.css/blob/master/dist/instagram.css
[data binding in svelte]:
  https://scottspence.com/posts/data-binding-in-svelte
[github]:
  https://github.com/spences10/insta-styled/blob/main/src/routes/%2Bpage.svelte
