<script context="module">
  export function load({ error, status }) {
    return {
      props: { error, status },
    }
  }
</script>

<script>
  export let error, status
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<h1>{status}</h1>
<p>That's a nop! 😭</p>
<p>{error.message}</p>
