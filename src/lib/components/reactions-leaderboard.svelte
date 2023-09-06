<script lang="ts">
  import { reactions } from '$lib/reactions-config'

  export let leaderboard: ReactionEntry[]
</script>

<div class="m-0 mb-20 sm:-mx-30 lg:-mx-40">
  <div class="grid gap-4 grid-cols-1 relative md:grid-cols-2">
    {#each leaderboard as page}
      <a data-sveltekit-reload href={page.path} class="h-full">
        <aside
          class="flex flex-col justify-between rounded-box font-bold h-full p-5 transition card shadow-lg hover:text-accent-focus border border-secondary"
        >
          <div>
            <h3 class="mb-5 text-2xl">{page.title}</h3>
          </div>
          <div class="mt-5 flex flex-wrap justify-between">
            {#each reactions as reaction}
              <span class="btn btn-primary text-xl flex-1 md:flex-none min-w-[calc(50%-0.5rem)] md:min-w-0 mr-2 mb-2">
                {reaction.emoji}
                {!page[reaction.type] ? 0 : page[reaction.type]}
              </span>
            {/each}
          </div>
        </aside>
      </a>
    {/each}
  </div>
</div>
