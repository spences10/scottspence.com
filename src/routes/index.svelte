<script context="module">
  export async function load({ page }) {
    try {
      const Post = await import(`../../copy/about.md`)
      return {
        props: {
          Post: Post.default,
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
  import Head from '$lib/components/head.svelte'
  import { description, name } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Post
</script>

<Head
  title={`Welcome! · ${name}`}
  {description}
  image={ogImageUrl(name, 'scottspence.com', name)}
/>

<Post />
