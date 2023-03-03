<script lang="ts">
  import { page } from '$app/stores'
</script>

<svelte:head>
  <title>Ruh-roh! {$page.status}</title>
</svelte:head>

<main class="all-prose">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message}</p>
  <p>That's a nop! 😭</p>
  <p>It looks like <code>{$page.url}</code> doesn't exist</p>
  <p>
    Maybe check out the <a href="/posts">posts</a> page? Or go to the
    <a href="/">home</a> page.
  </p>
</main>
