<script lang="ts">
  import { page } from '$app/stores'

  let links = [`/posts`, `/tags`, `/speaking`, `/contact`]
</script>

<nav
  class="sticky top-0 z-10 backdrop-filter bg-base-100/90 backdrop-blur-xl py-4 mb-10 hidden flex-none px-2 mx-2 lg:flex"
>
  <ul
    class="flex px-4 justify-between items-center container max-w-3xl mx-auto"
  >
    {#each links as link}
      <li>
        <a
          class={`text-xl link link-primary capitalize ${
            $page.url.pathname === link && `link-secondary`
          }`}
          href={link}
        >
          {link.slice(1)}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<div
  class="btm-nav lg:hidden border rounded-xl max-w-[95vw] mb-2 mx-auto z-10 bg-primary"
>
  {#each links as link}
    <a
      href={link}
      class={`link link-primary-content capitalize ${
        $page.url.pathname === link && `link-secondary`
      }`}
    >
      {link.slice(1)}
    </a>
  {/each}
</div>
