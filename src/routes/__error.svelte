<script context="module">
  export const load = async ({ error, status, page: { path } }) => {
    return {
      props: { error, status, path },
    }
  }
</script>

<script>
  export let error, status, path
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<main class="all-prose">
  <h1>{status}</h1>
  <p>{error.message}</p>
  <p>That's a nop! 😭</p>
  <p>It looks like <code>{path}</code> doesn't exist</p>
  <p>
    Maybe check out the <a href="/posts">posts</a> page? Or go to the
    <a href="/">home</a> page.
  </p>
</main>
