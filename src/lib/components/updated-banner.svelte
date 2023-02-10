<script>
  import { WarningTriangle } from '$lib/icons'
  import { compareDesc } from 'date-fns'
  import DateDistance from './date-distance.svelte'

  export let date = new Date()
  export let updated = new Date()

  let has_beenupdated = compareDesc(new Date(updated), new Date(date))
</script>

{#if has_beenupdated}
  <div class="alert alert-warning shadow-lg">
    <div>
      <WarningTriangle />
      <span>
        Hey! Thanks for stopping by! Looks like this post was updated
        <span class="font-bold italic">
          <DateDistance date={new Date(updated)} /> ago.
        </span>
        Just bear in mind it was originally posted
        <span class="font-bold italic">
          <DateDistance date={new Date(date)} /> ago.
        </span>
        If there's anything in here which doesn't make sense,
        <a class='link' href="/contact"> please get in touch.</a>
      </span>
    </div>
  </div>
{:else}
  <div class="alert alert-warning shadow-lg">
    <div>
      <WarningTriangle />
      <span>
        Hey! Thanks for stopping by! Just a word of warning, this post
        is
        <span class="font-bold italic">
          <DateDistance date={new Date(date)} /> old.
        </span>
        If there's technical information in here it's more than likely
        out of date.
      </span>
    </div>
  </div>
{/if}
