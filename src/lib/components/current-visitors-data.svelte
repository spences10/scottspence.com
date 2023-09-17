<script>
  import { visitors_store } from '$lib/stores'
  import { mouse_position } from '$lib/utils'
  
  let visitors = $visitors_store
</script>

<div
  class="not-prose text-sm fixed z-20 border border-primary rounded-box p-5 shadow-xl bg-base-100 text-base-content"
  style={`top: ${$mouse_position.y}px; left: ${$mouse_position.x}px;`}
>
  <h3 class="font-bold text-xl mb-2">Current Site Visitors</h3>
  <h4 class="font-bold mb-2">
    Total Visitors: {visitors.total}
  </h4>
  <section>
    <h4 class="font-semibold">Current Pages:</h4>
    <ul class="mb-2">
      {#each visitors.content as { hostname, pathname, total }}
        <li>
          <a
            href={pathname}
            target="_blank"
            rel="noopener noreferrer"
            class="link link-primary"
          >
            {hostname}{pathname}
          </a>
          ({total})
        </li>
      {/each}
    </ul>
  </section>
  <section>
    <h4 class="font-semibold">Referrers:</h4>
    <ul>
      {#each visitors.referrers as { referrer_hostname, referrer_pathname, total }}
        <li>
          <span class="link link-primary cursor-not-allowed">
            {referrer_hostname}{referrer_pathname}
          </span>
          ({total})
        </li>
      {/each}
    </ul>
  </section>
</div>
