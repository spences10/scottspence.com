<script context="module">
  export const load = async ({ fetch }) => {
    try {
      const res = await fetch('/github-contributions.json')
      let contributions = await res.json()

      const Copy = await import(`../../copy/portfolio.md`)
      return {
        props: {
          Copy: Copy.default,
          contributions,
        },
      }
    } catch (e) {
      return {
        status: 404,
        error: 'Uh oh!',
      }
    }
  }
</script>

<script>
  import Head from '@components/head.svelte'
  import GithubContributions from '@lib/components/github-contributions.svelte'
  import { name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'

  export let Copy
  export let contributions
</script>

<Head
  title={`Portfolio Page, recent projects, GitHub contributions and more · ${name}`}
  description={`${name}'s Portfolio Page. Recent projects, GitHub contributions and more`}
  image={ogImageUrl(
    name,
    `scottspence.com`,
    `Scott Spence Portfolio`
  )}
  url={`${website}/portfolio`}
/>

<GithubContributions {contributions} />

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
