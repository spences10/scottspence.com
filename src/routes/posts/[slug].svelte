<script context="module">
  // export const prerender = true
  export async function load({ fetch, page: { params } }) {
    const { slug } = params
    const res = await fetch(`/posts/${slug}.json`)
    if (res.ok) {
      const { post } = await res.json()
      return {
        props: { post },
      }
    }
  }
</script>

<script>
  import ButtButt from '$lib/components/butt-butt.svelte'
  import Head from '$lib/components/head.svelte'
  import IsPrivateBanner from '$lib/components/is-private-banner.svelte'
  import PopularPosts from '$lib/components/popular-posts.svelte'
  import ShareWithTweet from '$lib/components/share-with-tweet.svelte'
  import TableOfContents from '$lib/components/table-of-contents.svelte'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import { format } from 'date-fns'
  import { onMount } from 'svelte'
  import truncateHtml from 'truncate-html'

  export let post

  // metadata
  const { html, title, date, readingTime, slug, isPrivate, tags } =
    post

  const url = `${website}/posts/${slug}`

  let headingNodeList
  let headings
  const getHeadings = async () => {
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

  let excerpt = truncateHtml(html, 150, {
    ellipsis: '...',
    stripTags: true,
  })
</script>

<Head
  title={`${title} · ${name}`}
  description={excerpt}
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
      <a sveltekit:prefetch href={`/tags/${tag}`}>
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

  <div class="all-prose mb-10">
    {@html html}
  </div>

  <div class="flex flex-col w-full my-10">
    <div class="divider" />
  </div>

  <div class="grid justify-items-center mb-24">
    <ShareWithTweet
      buttonText="Useful? Share it on Twitter."
      tweetText={`Check out this post from @spences10, ${title}: ${url}`}
    />
  </div>

  <PopularPosts />
  <ButtButt />
</article>
