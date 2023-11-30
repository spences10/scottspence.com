<script lang="ts">
  import { visitors_store } from '$lib/stores'
  import { mouse_position } from '$lib/utils'

  let visitors = $visitors_store
</script>

<div
  class="not-prose text-sm fixed z-20 border border-primary rounded-box p-5 shadow-xl bg-base-100 text-base-content"
  style={`top: ${$mouse_position.y}px; left: ${$mouse_position.x}px;`}
>
  <h3 class="font-bold text-xl mb-2">Current Site Visitors</h3>
  <section>
    <h4 class="font-semibold text-lg mb-2">Recent Page Visits:</h4>
    <ul class="mb-2">
      {#each visitors.visitor_data as { pathname, title, recent_visitors }}
        <li class="text-base-content mb-2">
          {title === 'Unknown' ? pathname : title}
          <span class="font-bold">{recent_visitors}</span>
        </li>
      {/each}
    </ul>
  </section>
</div>
