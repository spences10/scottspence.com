<script context="module">
  // export const prerender = true

  import Head from '$lib/components/head.svelte'
  import { description, name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export async function load({ fetch, page: { params } }) {
    const { slug } = params
    const res = await fetch(`/tags/${slug}.json`)
    if (res.ok) {
      const { tag } = await res.json()
      return {
        props: { tag, slug },
      }
    }
  }
</script>

<script>
  export let tag
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

<h1 class="font-bold mb-5 text-5xl">Posts for {slug}</h1>

<ul>
  {#each tag as { title, slug, isPrivate }}
    {#if !isPrivate}
      <li class="my-4 text-xl">
        <a
          class="mr-6 transition link hover:text-primary"
          sveltekit:prefetch
          href={`/posts/${slug}`}>{title}</a
        >
      </li>
    {/if}
  {/each}
</ul>
