<script lang="ts">
  import { reactions } from '$lib/reactions-config'

  interface Props {
    leaderboard: ReactionEntry[]
  }

  let { leaderboard }: Props = $props()

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

<section class="sm:-mx-30 m-0 mb-20 lg:-mx-40">
  <div class="relative grid grid-cols-1 gap-8 md:grid-cols-2">
    {#each leaderboard as page (page.path)}
      <a
        target="_blank"
        rel="noopener noreferrer"
        data-sveltekit-reload
        href={page.path}
        class="h-full"
      >
        <article
          class="card flex h-full flex-col justify-between rounded-box border border-secondary p-5 font-bold shadow-lg transition hover:text-accent"
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
                  class="-mr-1 text-xs"
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
                class="btn btn-primary mb-2 mr-2 min-w-[calc(50%-0.5rem)] flex-1 text-xl md:min-w-0 md:flex-none"
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
