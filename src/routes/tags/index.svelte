<script context="module">
  export const prerender = true

  import Head from '$lib/components/head.svelte';
  import { getPostTags } from '$lib/get-post-tags';
  import { description,name,website } from '$lib/info';
  import { ogImageUrl } from '$lib/og-image-url-build';

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

<Head
  title={`Posts by tag · ${name}`}
  {description}
  image={ogImageUrl(name, `scottspence.com`, `Tags`)}
  url={`${website}/tags`}
/>

<h1 class='font-bold mb-5 text-5xl'>Posts by Tag</h1>

<ul class="flex flex-wrap justify-start">
  {#each tags as tag}
    <li class="my-4 text-xl">
      <a
        class="mr-6 transition link hover:text-primary"
        href={`tags/${tag}`}>{tag} ({postsByTag[tag].length})</a
      >
    </li>
  {/each}
</ul>
