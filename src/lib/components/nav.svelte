<script>
  import { page } from '$app/stores'
</script>

<nav class="sticky top-0 z-10 bg-base-100">
  <ul class="flex mb-8 py-2 px-4 justify-between items-center">
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
  </ul>
</nav>
