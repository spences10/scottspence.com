<script lang="ts">
  import { goto, preloadData, pushState } from '$app/navigation'
  import { page } from '$app/stores'
  import {
    ButtButt,
    CurrentVisitorsData,
    Head,
    IsPrivateBanner,
    PopularPosts,
    Reactions,
    ShareWithTweet,
    TableOfContents,
    UpdatedBanner,
  } from '$lib/components'
  import { name, website } from '$lib/info'
  import { type VisitorEntry } from '$lib/stores'
  import {
    get_headings,
    og_image_url,
    update_toc_visibility,
  } from '$lib/utils'
  import {
    differenceInDays,
    differenceInYears,
    format,
  } from 'date-fns'
  import * as Fathom from 'fathom-client'
  import StatsPage from '../../stats/[slug]/+page.svelte'
  import Modal from './modal.svelte'

  let { data } = $props()

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
  let { count } = data

  const url = `${website}/posts/${slug}`

  let path = $page.route.id

  let end_of_copy: HTMLElement | null
  let show_table_of_contents = $state(true)
  let headings_promise:
    | Promise<{ label: string; href: string }[]>
    | undefined = $state()

  $effect(() => {
    headings_promise = get_headings()
  })

  let current_path = $page.url.pathname

  let current_visitor_data: VisitorEntry | undefined

  // TODO: Fix this shit
  // $: {
  //   if ($visitors_store && $visitors_store.visitor_data) {
  //     current_visitor_data = $visitors_store.visitor_data.find(
  //       visitor => visitor.pathname === slug,
  //     )
  //   }
  // }

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy, -200)
  }

  let show_current_visitor_data = $state(false)
  let modal = $state() as HTMLDialogElement

  const show_modal = async (
    e: MouseEvent & { currentTarget: HTMLAnchorElement },
  ) => {
    if (e.metaKey || e.ctrlKey) return
    e.preventDefault()

    // Track the event with Fathom
    Fathom.trackEvent(`analytics click: ${current_path}`)

    // get URL
    const { href } = e.currentTarget as HTMLAnchorElement

    // get result of `load` function
    const result = await preloadData(href)

    // create new history entry
    if (result.type === 'loaded' && result.status === 200) {
      // Serialize the data
      const serialized_data = JSON.parse(JSON.stringify(result.data))
      pushState(href, { selected: serialized_data })
      modal.showModal()
    } else {
      goto(href)
    }
  }

  const close_modal = () => {
    history.back()
    modal.close()
  }
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
  <h1 class="mb-1 text-5xl font-black">{title}</h1>
  <div class="mb-3 mt-4 uppercase">
    <div class="mb-1">
      <time datetime={new Date(date).toISOString()}>
        {format(new Date(date), 'MMMM d, yyyy')}
      </time>
      &bull;
      <span>{readingTime.text}</span>
    </div>
    <div>
      {#each tags as tag}
        <a href={`/tags/${tag}`}>
          <span
            class="badge badge-primary mr-2 text-primary-content shadow-md transition hover:bg-accent hover:text-secondary-content"
          >
            {tag}
          </span>
        </a>
      {/each}
      {#if differenceInDays(new Date(), new Date(date)) < 31}
        <span
          class="badge badge-secondary cursor-pointer font-bold text-secondary-content shadow-md transition hover:bg-accent hover:text-secondary-content"
        >
          new
        </span>
      {/if}
    </div>
  </div>
  {#if current_visitor_data}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
      onmouseenter={() => (show_current_visitor_data = true)}
      onmouseleave={() => (show_current_visitor_data = false)}
      class="inline-block cursor-pointer text-sm"
    >
      <p>
        {current_visitor_data.recent_visitors}
        {current_visitor_data.recent_visitors > 1
          ? `people`
          : `person`} viewing this page live
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
    class="mb-5 mt-10 flex w-full flex-col"
    bind:this={end_of_copy}
  >
    <div class="divider divider-secondary"></div>
  </div>

  <Reactions data={count} path={current_path} />

  <div class="flex justify-center">
    <a
      onclick={show_modal}
      href="/stats/{$page.params.slug}"
      class="btn btn-primary btn-lg mb-20 px-10 text-xl shadow-lg"
    >
      ✨ View the stats for this post ✨
    </a>
  </div>

  <Modal bind:modal on:close={close_modal}>
    {#if $page.state.selected}
      <StatsPage data={$page.state.selected} />
    {/if}
  </Modal>

  <div class="mb-24 grid justify-items-center">
    <ShareWithTweet
      buttonText="Useful? Share it on Twitter."
      tweetText={`Check out this post from @spences10, ${title}: ${url}`}
    />
  </div>

  <PopularPosts />
  <ButtButt />
</article>
