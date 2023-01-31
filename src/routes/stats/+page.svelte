<script>
  import { popular_posts_store } from '$lib/stores'

  /** @type {import('./$types').PageData} */
  export let data
  let { analytics } = data
</script>

<pre>{JSON.stringify($popular_posts_store, null, 2)}</pre>

<pre>{JSON.stringify(analytics, null, 2)}</pre>
