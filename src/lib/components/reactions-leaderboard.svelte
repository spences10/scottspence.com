<script lang="ts">
  import { reactions } from '$lib/reactions-config'

  export let leaderboard: ReactionEntry[]

  const get_reaction_count = (
    path: string,
    reaction_type: string,
  ) => {
    const entry = leaderboard.find(
      page =>
        page.path === path && page.reaction_type === reaction_type,
    )
    return entry ? entry.count : 0
  }
</script>

<section class="m-0 mb-20 sm:-mx-30 lg:-mx-40">
  <div class="grid gap-8 grid-cols-1 relative md:grid-cols-2">
    {#each leaderboard as page (page.path)}
      <a
        target="_blank"
        rel="noopener noreferrer"
        data-sveltekit-reload
        href={page.path}
        class="h-full"
      >
        <article
          class="flex flex-col justify-between rounded-box font-bold h-full p-5 transition card shadow-lg hover:text-accent border border-secondary"
        >
          <h3 class="mb-5 text-2xl">
            {#if page.rank === 1}
              <span class="text-3xl">🥇</span>
            {:else if page.rank === 2}
              <span class="text-3xl">🥈</span>
            {:else if page.rank === 3}
              <span class="text-3xl">🥉</span>
            {:else if +page.rank > 3}
              <span class="text-accent">
                <span
                  class="text-xs -mr-1"
                  style="vertical-align: top;">#</span
                >
                {page.rank}
              </span>
            {/if}
            {page.title}
          </h3>
          <div class="mt-5 flex flex-wrap justify-between">
            {#each reactions as reaction}
              <span
                class="btn btn-primary text-xl flex-1 md:flex-none min-w-[calc(50%-0.5rem)] md:min-w-0 mr-2 mb-2"
              >
                {reaction.emoji}
                {get_reaction_count(page.path, reaction.type)}
              </span>
            {/each}
          </div>
        </article>
      </a>
    {/each}
  </div>
</section>
