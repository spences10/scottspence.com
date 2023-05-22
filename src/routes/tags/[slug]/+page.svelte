<script lang="ts">
  import { Head } from '$lib/components'
  import { description, name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data

  const { posts_by_tag, slug: tag_slug } = data
  const url: string = `${website}/tags/${tag_slug}`

  const tag = tag_slug ?? ''
</script>

<Head
  title={`Posts relating to ${tag} - ${name}`}
  {description}
  image={og_image_url(
    name,
    'scottspence.com',
    `Posts relating to ${tag}`
  )}
  {url}
/>

<h1 class="font-bold mb-5 text-5xl">Posts for {tag}</h1>

<ul class="mb-20">
  {#each posts_by_tag[tag] as { title, slug: post_slug }}
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
