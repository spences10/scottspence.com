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
  import CurrentVisitorsData from '$lib/components/current-visitors-data.svelte'
  import Reactions from '$lib/components/reactions.svelte'
  import { name, website } from '$lib/info'
  import { visitors_store } from '$lib/stores'
  import {
    get_current_page_visitors,
    get_headings,
    og_image_url,
    update_toc_visibility,
  } from '$lib/utils'
  import {
    differenceInDays,
    differenceInYears,
    format,
  } from 'date-fns'
  import { onMount } from 'svelte'

  export let data
  let { Content } = data
  let {
    title,
    date,
    updated,
    preview,
    readingTime,
    slug,
    isPrivate,
    tags,
  } = data.meta
  let { daily_visits, monthly_visits, yearly_visits, count } = data

  const url = `${website}/posts/${slug}`

  let path = $page.route.id

  let end_of_copy: HTMLElement | null
  let show_table_of_contents = true
  let headings_promise: Promise<{ label: string; href: string }[]>

  onMount(() => {
    headings_promise = get_headings()
  })

  let current_path = $page.url.pathname
  let content = $visitors_store?.visitors.content || []

  let visitors_count = get_current_page_visitors(
    current_path,
    content,
  )

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy, -200)
  }

  let show_current_visitor_data = false
</script>

<svelte:window on:scroll={handle_scroll} />

<Head
  title={`${title} - ${name}`}
  description={preview}
  image={og_image_url(name, `scottspence.com`, title)}
  {url}
/>

{#await headings_promise}
  Loading...
{:then headings}
  {#if show_table_of_contents}
    <TableOfContents {headings} />
  {/if}
{:catch error}
  <p>Failed to load table of contents: {error.message}</p>
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
            class="badge badge-primary text-primary-content transition hover:bg-accent hover:text-secondary-content shadow-md"
          >
            {tag}
          </span>
        </a>
      {/each}
      {#if differenceInDays(new Date(), new Date(date)) < 31}
        <span
          class="badge badge-secondary text-secondary-content font-bold transition hover:bg-accent hover:text-secondary-content cursor-pointer shadow-md"
        >
          new
        </span>
      {/if}
    </div>
  </div>
  {#if visitors_count?.total > 0}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      on:mouseenter={() => (show_current_visitor_data = true)}
      on:mouseleave={() => (show_current_visitor_data = false)}
      class="text-sm cursor-pointer inline-block"
    >
      <p>
        {visitors_count.total}
        {visitors_count.total > 1 ? `people` : `person`} viewing this page
        live
      </p>
      {#if show_current_visitor_data}
        <CurrentVisitorsData />
      {/if}
      <p class="text-sm">
        Read to the end of the post for more stats
      </p>
    </span>
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
    <svelte:component this={Content} />
  </div>

  <div
    class="flex flex-col w-full mt-10 mb-5"
    bind:this={end_of_copy}
  >
    <div class="divider divider-secondary" />
  </div>

  <Reactions data={count} path={current_path} />

  <StatsCard {daily_visits} {monthly_visits} {yearly_visits} />

  <div class="grid justify-items-center mb-24">
    <ShareWithTweet
      buttonText="Useful? Share it on Twitter."
      tweetText={`Check out this post from @spences10, ${title}: ${url}`}
    />
  </div>

  <PopularPosts />
  <ButtButt />
</article>
