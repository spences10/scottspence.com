<script lang="ts">
  import { page } from '$app/stores'
  import {
    ButtButt,
    Head,
    IsPrivateBanner,
    PopularPosts,
    ShareWithTweet,
    StatsCard,
    TableOfContents,
    UpdatedBanner,
  } from '$lib/components'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import { visitors_store } from '$lib/stores'
  import type { VisitorsData } from '$lib/stores';
  import { get_current_page_visitors } from '$lib/utils'
  import {
    differenceInDays,
    differenceInYears,
    format,
    getDate,
    getMonth,
    parseISO,
  } from 'date-fns'
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

  let headingNodeList: NodeListOf<HTMLHeadingElement>
  let headings: { label: string; href: string }[]

  const getHeadings = async () => {
    headings
  }

  onMount(() => {
    headingNodeList = document.querySelectorAll('h2')
    headings = []
    for (const h2 of headingNodeList) {
      headings.push({
        label: h2.innerText,
        href: `#${h2.id}`,
      })
    }
  })

  let current_path = $page.url.pathname
  let { content } = $visitors_store as VisitorsData

  let visitors_count = get_current_page_visitors(
    current_path,
    content
  )

  // let hourly_visits = data.hourly_visits
  let daily_visits = data.daily_visits[0]
  let monthly_visits = data.monthly_visits[0]
  let yearly_visits = data.yearly_visits[0]
</script>

<Head
  title={`${title} - ${name}`}
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
            class="badge badge-primary text-primary-content transition hover:bg-secondary-focus hover:text-secondary-content shadow-md"
          >
            {tag}
          </span>
        </a>
      {/each}
      {#if differenceInDays(new Date(), new Date(date)) < 31}
        <span
          class="badge badge-secondary text-secondary-content font-bold transition hover:bg-secondary-focus hover:text-secondary-content cursor-pointer shadow-md"
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

  {#if differenceInYears(new Date(), new Date(date)) >= 1 || updated}
    <UpdatedBanner
      updated={updated === undefined ? date : updated}
      {date}
    />
  {/if}

  <div class="all-prose mb-10">
    <svelte:component this={component} />
  </div>

  <div class="flex flex-col w-full mt-10 mb-5">
    <div class="divider" />
  </div>

  {#if daily_visits?.visits > 0}
    <StatsCard
      title="Daily analytics for this post"
      stats={daily_visits}
      time_period="day"
    />
  {/if}
  {#if monthly_visits?.visits > 0 && getDate(new Date()) > 1}
    <StatsCard
      title="Month to date analytics for this post"
      stats={monthly_visits}
      time_period="month"
    />
  {/if}
  {#if (yearly_visits?.date > 0 && getMonth(parseISO(monthly_visits?.date)) > 0) || (!monthly_visits?.visits && yearly_visits?.visits > 0)}
    <StatsCard
      title="Year to date analytics for this post"
      stats={yearly_visits}
      time_period="year"
    />
  {/if}
  {#if daily_visits?.visits > 0 || monthly_visits?.visits > 0 || yearly_visits?.visits > 0}
    <div class="flex flex-col w-full mt-5 mb-10">
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
