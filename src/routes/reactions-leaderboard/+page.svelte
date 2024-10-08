<script lang="ts">
  import ReactionsLeaderboard from '$lib/components/reactions-leaderboard.svelte'
  import { name, website } from '$lib/info.js'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils/og-image-url-build.js'
  import { Head } from 'svead'

  interface Props {
    data: { leaderboard: ReactionEntry[] }
  }

  let { data }: Props = $props()
  let { leaderboard = [] } = data

  const url = `${website}/reactions-leaderboard`

  const seo_config = create_seo_config({
    title: `Reactions leaderboard - ${name}`,
    description: 'All of the most reacted to posts on the site.',
    open_graph_image: og_image_url(
      name,
      'scottspence.com',
      `Reactions leaderboard`,
    ),
    url: url,
    slug: 'reactions-leaderboard',
  })
</script>

<Head {seo_config} />

<div class="all-prose mb-12">
  <section aria-labelledby="leaderboard-heading">
    <h1 id="leaderboard-heading">Reactions leaderboard</h1>
    <p>Here's the most reacted to posts on the site.</p>
  </section>
</div>

<ReactionsLeaderboard {leaderboard} />
