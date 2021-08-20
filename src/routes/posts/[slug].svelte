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
      .sort((a, b) => {
        const da = new Date(a.metadata.date).getTime()
        const db = new Date(b.metadata.date).getTime()
        if (da < db) return -1
        if (da === db) return 0
        if (da > db) return 1
      })

    const { slug } = params
    const index = posts.findIndex(post => slug === post.metadata.slug)

    const { metadata, component } = posts[index]

    return {
      props: {
        component,
        ...metadata,
      },
    }
  }
</script>

<script>
  import ButtButt from '$lib/components/butt-butt.svelte'
  import Head from '$lib/components/head.svelte'
  import IsPrivateBanner from '$lib/components/is-private-banner.svelte'
  import PopularPosts from '$lib/components/popular-posts.svelte'
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
  export let isPrivate
  export let tags

  const url = `${website}/posts/${slug}`

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
  image={ogImageUrl(name, `scottspence.com`, title)}
  {url}
/>

{#await getHeadings()}
  Loading...
{:then}
  <TableOfContents {headings} />
{/await}

<article>
  <h1 class="font-black mb-1 text-5xl">{title}</h1>
  <div class="mb-10 mt-4 uppercase">
    <time datetime={new Date(date).toISOString()}
      >{format(new Date(date), 'MMMM d, yyyy')}</time
    >
    •
    <span>{readingTime.text}</span>
    <br />
    {#each tags as tag}
      <a href={`/tags/${tag}`}>
        <span
          class="mr-1 badge badge-primary transition hover:bg-secondary-focus"
          >{tag}</span
        >
      </a>
    {/each}
  </div>
  {#if isPrivate}
    <IsPrivateBanner />
  {/if}
  <div class="all-prose">
    <svelte:component this={component} />
  </div>

  <div class="mt-8 mb-16 divider" />
  <PopularPosts />
  <ButtButt />
</article>
