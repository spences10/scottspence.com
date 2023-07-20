<script lang="ts">
  import { enhance } from '$app/forms'
  import { reactions } from '$lib/reactions-config'
  import type { ActionResult } from '@sveltejs/kit'
  import { writable } from 'svelte/store'
  import NumberFlip from './reactions-number-flip.svelte'

  export let path: string | null = '/'
  export let data: ReactionsData | null = null

  let button_disabled = writable(false)

  const handle_result = (result: ActionResult) => {
    if (result.type === 'failure') {
      $button_disabled = true
      setTimeout(() => {
        $button_disabled = false
      }, result?.data?.time_remaining * 1000)
    }
  }
</script>

<div class="flex justify-center mb-10">
  <form
    method="POST"
    action="/reactions?path={path}"
    use:enhance={() => {
      return ({ update, result }) => {
        handle_result(result)
        console.log(JSON.stringify(result, null, 2))
        update({ reset: false })
      }
    }}
    class="grid grid-cols-1 gap-5 sm:flex w-full sm:justify-between"
  >
    {#each reactions as reaction}
      <NumberFlip
        count={data?.count?.[reaction.type] || 0}
        emoji={reaction.emoji}
        value={reaction.type}
        disabled={$button_disabled}
        aria_label={`Submit ${
          reaction.type
        } reaction. Current count: ${
          data?.count?.[reaction.type] || 0
        }`}
      />
    {/each}
  </form>
</div>
