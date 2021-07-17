<script context="module">
  export const prerender = true

  export const load = async () => {
    const posts = Object.entries(
      import.meta.globEager('/posts/**/*.md')
    )
      // get post metadata
      .map(([, post]) => post.metadata)
      // sort by date
      .sort((b, a) => {
        const da = new Date(a.date).getTime()
        const db = new Date(b.date).getTime()
        if (da < db) return -1
        if (da === db) return 0
        if (da > db) return 1
      })

    return {
      props: {
        posts,
      },
    }
  }
</script>

<script>
  import ButtonLink from '$lib/components/ButtonLink.svelte'
  import { name } from '$lib/info.js'
  import { format } from 'date-fns'

  export let posts
</script>

<svelte:head>
  <title>{name}</title>
</svelte:head>

<div class="flex flex-col flex-grow">
  <div
    class="flex-grow divide-y divide-gray-300 dark:divide-gray-700"
  >
    {#each posts as post}
      {#if !post.isPrivate}
        <div class="py-8 first:pt-0">
          <div>
            <h1 class="!mt-0 !mb-1">
              <a href={`/posts/${post.slug}`}>{post.title}</a>
            </h1>
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            •
            <span>{post.readingTime.text}</span>
          </div>
          <div>{@html post.previewHtml}</div>
          <div class="flex justify-end w-full">
            <ButtonLink href={`/posts/${post.slug}`}
              >Read More</ButtonLink
            >
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
