<script lang="ts">
  import Head from '$lib/components/head.svelte'
  import ReactionsLeaderboard from '$lib/components/reactions-leaderboard.svelte'
  import { name, website } from '$lib/info.js'
  import { og_image_url } from '$lib/utils/og-image-url-build.js'

  export let data
  let { leaderboard } = data

  const url = `${website}/reactions-leaderboard`
</script>

<Head
  title={`Reactions leaderboard - ${name}`}
  description="All of the most reacted to posts on the site."
  image={og_image_url(
    name,
    'scottspence.com',
    `Reactions leaderboard`,
  )}
  {url}
/>

<h1 class="font-bold mb-10 text-5xl">Reactions leaderboard</h1>

<ReactionsLeaderboard {leaderboard} />
