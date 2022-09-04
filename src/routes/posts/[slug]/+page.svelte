<script>
  import ButtButt from '@components/butt-butt.svelte'
  import Head from '@components/head.svelte'
  import IsPrivateBanner from '@components/is-private-banner.svelte'
  import PopularPosts from '@components/popular-posts.svelte'
  import ShareWithTweet from '@components/share-with-tweet.svelte'
  import TableOfContents from '@components/table-of-contents.svelte'
  import { name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'
  import { differenceInDays, format } from 'date-fns'
  import { onMount } from 'svelte'

  // metadata
  export let data
  let {
    title,
    date,
    updated,
    preview,
    readingTime,
    slug,
    isPrivate,
    tags,
    component,
  } = data

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
    <time datetime={new Date(date).toISOString()}>
      {format(new Date(date), 'MMMM d, yyyy')}
    </time>
    &bull;
    <span>{readingTime.text}</span>
    <br />
    {#if updated}
      <span class="text-xs font-bold">
        updated
        <time datetime={new Date(updated).toISOString()}>
          {format(new Date(updated), 'MMMM d, yyyy')}
        </time>
      </span>
    {/if}
    <div class="space-x-2">
      {#each tags as tag}
        <a href={`/tags/${tag}`}>
          <span
            class="badge badge-primary text-primary-content transition hover:bg-secondary-focus"
            >{tag}</span
          >
        </a>
      {/each}
      {#if differenceInDays(new Date(), new Date(date)) < 31}
        <span
          class="badge badge-secondary text-secondary-content font-bold transition hover:bg-secondary-focus cursor-pointer"
        >
          new
        </span>
      {/if}
    </div>
  </div>
  {#if isPrivate}
    <IsPrivateBanner />
  {/if}

  <div class="all-prose mb-10">
    <svelte:component this={component} />
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
