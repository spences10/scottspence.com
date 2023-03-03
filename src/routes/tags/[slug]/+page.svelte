<script lang="ts">
  import { Head } from '$lib/components'
  import { description, name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data: {
    postsByTag: {
      [key: string]: { metadata: { title: string; slug: string } }[]
    }
    slug: string
  }

  const {
    postsByTag,
    slug: tag_slug,
  }: { postsByTag: typeof data.postsByTag; slug: string } = data
  const url: string = `${website}/tags/${tag_slug}`
</script>

<Head
  title={`Posts relating to ${tag_slug} - ${name}`}
  {description}
  image={og_image_url(
    name,
    'scottspence.com',
    `Posts relating to ${tag_slug}`
  )}
  {url}
/>

<h1 class="font-bold mb-5 text-5xl">Posts for {tag_slug}</h1>

<ul>
  {#each postsByTag[tag_slug] as { metadata: { title }, metadata: { slug: post_slug } }}
    <li class="my-4 text-xl">
      <a
        class="mr-6 transition link hover:text-primary"
        href={`/posts/${post_slug}`}
      >
        {title}
      </a>
    </li>
  {/each}
</ul>
