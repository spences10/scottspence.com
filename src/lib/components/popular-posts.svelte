<script lang="ts">
  import { page } from '$app/stores'
  import { popular_posts_store } from '$lib/stores'
  import { number_crunch } from '$lib/utils'
  import * as Fathom from 'fathom-client'

  type PopularPostsPeriod = keyof PopularPosts
  let selected_period: PopularPostsPeriod = 'popular_posts_yearly'

  let posts: PopularPost[] = []

  $: {
    posts = $popular_posts_store[
      selected_period as PopularPostsPeriod
    ].slice(0, 4)
  }
</script>

{#if posts.length}
  <div class="m-0 mb-20 sm:-mx-30 lg:-mx-40">
    <p class="text-xl mb-8">
      Take a look at some popular content from me...
      <select
        bind:value={selected_period}
        class="select select-sm border border-secondary"
      >
        <option value="popular_posts_daily">Views today</option>
        <option value="popular_posts_monthly">Views this month</option
        >
        <option value="popular_posts_yearly">Views this year</option>
      </select>
    </p>

    <div
      class="grid gap-4 grid-cols-1 relative md:grid-cols-2 lg:grid-cols-4"
    >
      {#each posts as post}
        <a
          data-sveltekit-reload
          href={$page.url.origin + post.pathname}
          on:click={() => Fathom.trackGoal(`WKHRXHV8`, 0)}
          class="h-full"
        >
          <aside
            class="rounded-box font-bold h-full p-5 transition card shadow-lg hover:text-accent-focus border border-secondary"
          >
            <h3 class="mb-5 text-2xl">
              {post.title}
            </h3>
            <div class="mt-5">
              <span class="text-primary mb-4 bottom-0 absolute">
                Views: {number_crunch(post.pageviews)}
              </span>
            </div>
          </aside>
        </a>
      {/each}
    </div>
  </div>
{/if}
