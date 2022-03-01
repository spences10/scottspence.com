<script>
  import { page } from '$app/stores'
</script>

<nav
  class="sticky top-0 z-10 backdrop-filter bg-base/90 backdrop-blur-xl py-4 mb-10"
>
  <ul
    class="flex px-4 justify-between items-center container max-w-3xl mx-auto"
  >
    <li>
      <a
        class={`text-xl link link-primary ${
          $page.url.pathname === '/posts' &&
          `text-xl link link-secondary`
        }`}
        sveltekit:prefetch
        href="/posts">Posts</a
      >
    </li>
    <li>
      <a
        class={`text-xl link link-primary ${
          $page.url.pathname === '/tags' &&
          `text-xl link link-secondary`
        }`}
        sveltekit:prefetch
        href="/tags">Tags</a
      >
    </li>
    <li>
      <a
        class={`text-xl link link-primary ${
          $page.url.pathname === '/speaking' &&
          `text-xl link link-secondary`
        }`}
        sveltekit:prefetch
        href="/speaking">Speaking</a
      >
    </li>
    <li>
      <a
        class={`text-xl link link-primary ${
          $page.url.pathname === '/contact' &&
          `text-xl link link-secondary`
        }`}
        sveltekit:prefetch
        href="/contact">Contact</a
      >
    </li>
  </ul>
</nav>
