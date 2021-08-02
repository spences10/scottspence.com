<script context="module">
  export const prerender = true

  import { getPostTags } from '$lib/get-post-tags'

  export async function load() {
    const { tags, postsByTag } = await getPostTags()
    return {
      props: {
        tags,
        postsByTag,
      },
    }
  }
</script>

<script>
  export let tags
  export let postsByTag
</script>

<ul class="flex justify-start flex-wrap ">
  {#each tags as tag}
    <a href={`tags/${tag}`} class="mr-4"
      >{tag} ({postsByTag[tag].length})</a
    >
  {/each}
</ul>
