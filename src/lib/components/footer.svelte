<script lang="ts">
  import { page } from '$app/stores'
  import { Eye } from '$lib/icons'
  import { name, SITE_LINKS, SOCIAL_LINKS } from '$lib/info'
  import { popular_posts_store, visitors_store } from '$lib/stores'
  import { number_crunch } from '$lib/utils'
  import * as Fathom from 'fathom-client'
  import CurrentVisitorsData from './current-visitors-data.svelte'

  type PopularPostsPeriod = keyof PopularPosts
  let selected_period: PopularPostsPeriod = 'popular_posts_yearly'

  let posts: PopularPost[] = []
  let show_current_visitor_data = false

  $: {
    posts = $popular_posts_store[
      selected_period as PopularPostsPeriod
    ].slice(0, 6)
  }

  let total_visitors = 0
  $: if ($visitors_store && $visitors_store.visitor_data) {
    total_visitors = $visitors_store.visitor_data.reduce(
      (total, visitor) => total + visitor.recent_visitors,
      0,
    )
  }
</script>

<footer class="footer bg-primary p-10 text-primary-content">
  <div>
    <span class="footer-title">Popular Posts</span>
    {#each posts as post}
      <p>
        <a
          data-sveltekit-reload
          class="text-primary-content hover:opacity-50"
          href={$page.url.origin + post.pathname}
        >
          {post.title}
        </a>
        <span
          class="group tooltip relative cursor-pointer font-bold text-primary-content"
          data-tip={`
          Visits: ${number_crunch(post.visits)},
          Pageviews: ${number_crunch(post.pageviews)}
        `}
        >
          <Eye />
          {number_crunch(post.pageviews)}
        </span>
      </p>
    {/each}

    {#if total_visitors > 0}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        on:mouseenter={() => (show_current_visitor_data = true)}
        on:mouseleave={() => (show_current_visitor_data = false)}
        class="inline-block cursor-pointer"
      >
        <p
          class="mt-2 rounded-box bg-secondary px-2 py-1 tracking-wide text-secondary-content shadow-lg"
        >
          There's currently
          <span class="font-bold">
            {total_visitors}
          </span>
          live {total_visitors === 1 ? 'visitor' : 'visitors'}
        </p>
        {#if show_current_visitor_data}
          <CurrentVisitorsData />
        {/if}
      </span>
    {/if}
  </div>
  <div>
    <span class="footer-title">Site Links</span>
    {#each SITE_LINKS as link}
      <a
        href={`/${link.slug}`}
        on:click={() => Fathom.trackEvent(link.slug)}
        class="text-primary-content hover:opacity-50"
      >
        {link.title}
      </a>
    {/each}
  </div>
  <div>
    <span class="footer-title">Socials</span>
    <a rel="me" href="https://moth.social/@spences10">Mastodon</a>
    {#each SOCIAL_LINKS as social}
      <a
        class="text-primary-content hover:opacity-50"
        href={social.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {social.title}
      </a>
    {/each}
  </div>
</footer>
<div class="divider divider-secondary m-0 bg-primary"></div>
<div class="bg-primary text-primary-content">
  <p class="py-4 text-center">
    Copyright &copy; 2017 - {`${new Date().getFullYear()}`} - All rights
    reserved
    {name}
  </p>
</div>
