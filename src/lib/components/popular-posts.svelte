<script>
  import { POPULAR_POSTS } from '@lib/info'
  import { trackGoal } from 'fathom-client'
</script>

<div class="m-0 mb-20 sm:-mx-30 lg:-mx-40 ">
  <p class="text-xl mb-4">
    Take a look at some popular content from me...
  </p>
  <div
    class="grid gap-4 grid-cols-1 relative md:grid-cols-2 lg:grid-cols-4"
  >
    {#each POPULAR_POSTS as post}
      <a
        data-sveltekit-reload
        href={`/posts/${post.slug}`}
        on:click={() => trackGoal(`WKHRXHV8`)}
        class="h-full"
      >
        <aside
          class="rounded-xl font-bold h-full p-5 transition card shadow-lg hover:text-accent-focus"
        >
          <h3 class="mb-5 text-2xl">
            {post.title}
          </h3>
          <div class="mt-5">
            <span class="text-primary mb-4 bottom-0 absolute">
              Views: {post.views}
            </span>
          </div>
        </aside>
      </a>
    {/each}
  </div>
</div>
