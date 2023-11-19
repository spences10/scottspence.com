<script lang="ts">
  import { page } from '$app/stores'
  import { Envelope, Megaphone, News, Tag } from '$lib/icons'

  let links = [
    { href: `/posts`, title: `Posts`, icon: News },
    { href: `/tags`, title: `Tags`, icon: Tag },
    { href: `/speaking`, title: `Speaking`, icon: Megaphone },
    { href: `/contact`, title: `Contact`, icon: Envelope },
  ]
</script>

<nav
  class="sticky top-0 z-10 backdrop-filter bg-base-100/50 backdrop-blur-xl py-4 mb-10 hidden flex-none px-2 mx-2 lg:flex"
>
  <ul
    class="flex px-4 justify-between items-center container max-w-3xl mx-auto"
  >
    {#each links as link}
      <li>
        <a
          class="flex items-center text-xl link link-primary space-x-2 {$page
            .url.pathname === link.href && `link-secondary`}"
          href={link.href}
        >
          <span class=''>
            <svelte:component
              this={link.icon}
              height="20px"
              width="20px"
              classes="link link-primary"
            />
          </span>
          <span class="inline-block align-text-bottom">
            {link.title}
          </span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<nav
  class="btm-nav lg:hidden rounded-box max-w-[95vw] mb-2 mx-auto z-10 bg-primary shadow-xl"
>
  {#each links as link}
    <a href={link.href}>
      <span
        class="link text-primary-content {$page.url.pathname ===
          link.href && `text-secondary-content`}"
      >
        <svelte:component
          this={link.icon}
          height="30px"
          width="30px"
        />
        <span class="sr-only">{link.title}</span>
      </span>
    </a>
  {/each}
</nav>
