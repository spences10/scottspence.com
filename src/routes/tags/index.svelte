<script context="module">
  import { getPostTags } from '$lib/get-post-tags'

  export const prerender = true

  export async function load() {
    const tagsAndPosts = await getPostTags()
    return {
      props: {
        tagsAndPosts,
      },
    }
  }
</script>

<script>
  export let tagsAndPosts
</script>

<pre>{JSON.stringify(tagsAndPosts, null, 2)}</pre>
