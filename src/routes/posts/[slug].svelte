<script context="module">
  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load({ page: { params } }) {
    // get all posts
    const posts = Object.entries(
      import.meta.globEager('/posts/**/*.md')
    )
      .map(([, post]) => ({
        // frontmatter data
        metadata: post.metadata,

        // the processed Svelte component from the markdown file
        component: post.default,
      }))
      .sort((b, a) => {
        const da = new Date(a.metadata.date).getTime()
        const db = new Date(b.metadata.date).getTime()
        if (da < db) return -1
        if (da === db) return 0
        if (da > db) return 1
      })

    const { slug } = params
    const index = posts.findIndex(post => slug === post.metadata.slug)

    const { metadata, component } = posts[index]

    // next/previous posts
    const next = posts[index - 1]?.metadata
    const previous = posts[index + 1]?.metadata

    return {
      props: {
        component,
        ...metadata,
        next,
        previous,
      },
    }
  }
</script>

<script>
  import ButtonLink from '$lib/components/button-link.svelte'
  import Head from '$lib/components/head.svelte'
  import TableOfContents from '$lib/components/table-of-contents.svelte'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import { format } from 'date-fns'
  import { onMount } from 'svelte'

  export let component

  // metadata
  export let title
  export let date
  export let preview
  export let readingTime
  export let slug
  export let next
  export let previous

  const url = `${website}/${slug}`

  let headingNodeList
  let headings
  async function getHeadings() {
    await headings
  }

  onMount(() => {
    headingNodeList = document.querySelectorAll('h2')
    headings = Array.from(headingNodeList).map(h2 => {
      return {
        label: h2.innerText,
        href: `#${h2.id}`,
      }
    })
  })
</script>

<Head
  title={`${title} · ${name}`}
  description={preview}
  image={ogImageUrl(name, 'scottspence.com', title)}
  {name}
  {url}
  {website}
/>

{#await getHeadings()}
  Loading...
{:then}
  <TableOfContents {headings} />
{/await}

<article>
  <h1 class="!mt-0 !mb-1">{title}</h1>
  <div>
    <time datetime={new Date(date).toISOString()}
      >{format(new Date(date), 'MMMM d, yyyy')}</time
    >
    •
    <span>{readingTime.text}</span>
  </div>
  <svelte:component this={component} />
</article>

<div class="pt-12 flex justify-between">
  {#if previous}
    <ButtonLink isBack href={`/posts/${previous.slug}`}
      >{previous.title}</ButtonLink
    >
  {:else}
    <div />
  {/if}
  {#if next}
    <ButtonLink href={`/posts/${next.slug}`}>{next.title}</ButtonLink>
  {/if}
</div>
