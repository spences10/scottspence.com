<script context="module">
  export const prerender = true

  import Head from '$lib/components/head.svelte'
  import { getPostTags } from '$lib/get-post-tags'
  import { description, name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

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

  const url = `${website}/tags/${slug}`
</script>

<Head
  title={`Posts relating to ${slug} · ${name}`}
  {description}
  image={ogImageUrl(
    name,
    'scottspence.com',
    `Posts relating to ${slug}`
  )}
  {url}
/>

<ul>
  {#each [...postsByTag[slug]] as post}
    <li class="my-4 text-xl">
      <a
        class="mr-6 transition link hover:text-primary"
        href={`/posts/${post.slug}`}>{post.title}</a
      >
    </li>
  {/each}
</ul>
