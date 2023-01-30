<script>
  import { page } from '$app/stores'
  import ButtButt from '@components/butt-butt.svelte'
  import Head from '@components/head.svelte'
  import IsPrivateBanner from '@components/is-private-banner.svelte'
  import PopularPosts from '@components/popular-posts.svelte'
  import ShareWithTweet from '@components/share-with-tweet.svelte'
  import TableOfContents from '@components/table-of-contents.svelte'
  import DateDistance from '@lib/components/date-distance.svelte'
  import { name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'
  import { visitors_store } from '@lib/stores'
  import { get_current_page_visitors } from '@lib/utils'
  import {
    differenceInDays,
    differenceInYears,
    format,
  } from 'date-fns'
  import { onMount } from 'svelte'

  // metadata
  export let data
  let {
    title,
    date,
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

  let current_path = $page.url.pathname
  let { content } = $visitors_store

  let visitors_count = get_current_page_visitors(
    current_path,
    content
  )

  let daily_visits = data.daily_visits[0]
</script>

<!-- <pre>{JSON.stringify(data.hourly_visits, null, 2)}</pre> -->
<pre>{JSON.stringify(data.daily_visits, null, 2)}</pre>
<!-- <pre>{JSON.stringify(data.monthly_visits, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify(data.yearly_visits, null, 2)}</pre> -->

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
  <div class="mb-3 mt-4 uppercase">
    <div class="mb-1">
      <time datetime={new Date(date).toISOString()}>
        {format(new Date(date), 'MMMM d, yyyy')}
      </time>
      &bull;
      <span>{readingTime.text}</span>
    </div>
    <div class="space-x-2">
      {#each tags as tag}
        <a href={`/tags/${tag}`}>
          <span
            class="badge badge-primary text-primary-content transition hover:bg-secondary-focus"
          >
            {tag}
          </span>
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
  {#if visitors_count?.total > 0}
    <p class="text-sm">
      {visitors_count.total}
      {visitors_count.total > 1 ? `people` : `person`} viewing this page
      live
    </p>
    <p class="mb-10 text-sm">
      Read to the end of the post for more stats
    </p>
  {/if}
  {#if isPrivate}
    <IsPrivateBanner />
  {/if}

  {#if differenceInYears(new Date(), new Date(date)) >= 1}
    <div class="alert alert-warning shadow-lg">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>
          Hey! Thanks for stopping by! Just a word of warning, this
          post is
          <span class="font-bold italic">
            <DateDistance date={new Date(date)} /> old.
          </span>
          If there's technical information in here it's more than likely
          out of date.
        </span>
      </div>
    </div>
  {/if}

  <div class="all-prose mb-10">
    <svelte:component this={component} />
  </div>

  <div class="flex flex-col w-full my-10">
    <div class="divider" />
  </div>

  {#if daily_visits.visits > 0}
    <p class="mb-2 pl-1">Daily analytics for this post</p>
    <div
      class="stats stats-vertical lg:stats-horizontal shadow-lg w-full border border-secondary"
    >
      <div class="stat">
        <div class="stat-title">Visits Today</div>
        <div class="stat-value text-2xl">{daily_visits.visits}</div>
        <div class="stat-desc">Jan 1st - Feb 1st</div>
      </div>

      <div class="stat">
        <div class="stat-title">Unique Visitors</div>
        <div class="stat-value text-2xl">{daily_visits.uniques}</div>
        <div class="stat-desc">↗︎ 400 (22%)</div>
      </div>

      <div class="stat">
        <div class="stat-title">Total Page Views</div>
        <div class="stat-value text-2xl">
          {daily_visits.pageviews}
        </div>
        <div class="stat-desc">↘︎ 90 (14%)</div>
      </div>
    </div>

    <div class="flex flex-col w-full my-10">
      <div class="divider" />
    </div>
  {/if}

  <div class="grid justify-items-center mb-24">
    <ShareWithTweet
      buttonText="Useful? Share it on Twitter."
      tweetText={`Check out this post from @spences10, ${title}: ${url}`}
    />
  </div>

  <PopularPosts />
  <ButtButt />
</article>
