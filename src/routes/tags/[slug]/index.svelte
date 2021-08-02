<script context="module">
  export const prerender = true

  import { getPostTags } from '$lib/get-post-tags'

  export async function load({ page }) {
    const { slug } = page.params
    const { postsByTag } = await getPostTags()
    return {
      props: {
        slug,
        postsByTag,
      },
    }
  }
</script>

<script>
  export let postsByTag
  export let slug
</script>

<ul>
  {#each [...postsByTag[slug]] as post}
    <li>
      <a href={`/posts/${post.slug}`}>{post.title}</a>
    </li>
  {/each}
</ul>
