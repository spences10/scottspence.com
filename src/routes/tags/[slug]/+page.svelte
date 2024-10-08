<script lang="ts">
  import { create_seo_config } from '$lib/seo'
  import { Head } from 'svead'

  interface Props {
    data: any
  }

  let { data }: Props = $props()

  const { posts_by_tag, slug: tag_slug } = data
  const tag = tag_slug ?? ''

  const seo_config = create_seo_config({
    title: `Posts relating to ${tag}`,
    description: `A collection of posts related to the tag "${tag}"`,
    slug: `tags/${tag_slug}`,
  })
</script>

<Head {seo_config} />

<h1 class="mb-5 text-5xl font-bold">Posts for {tag}</h1>

<ul class="mb-20">
  {#each posts_by_tag[tag] as { title, slug: post_slug }}
    <li class="my-4 text-xl">
      <a
        class="link mr-6 transition hover:text-primary"
        href={`/posts/${post_slug}`}
      >
        {title}
      </a>
    </li>
  {/each}
</ul>
