<script>
  import { format } from 'date-fns'
  import EdgeGlow from './edge-glow.svelte'

  export let post
</script>

<EdgeGlow>
  <article
    class="bg-base-100 mb-10 p-5 transition card hover:text-accent-focus first:pt-0"
  >
    <a sveltekit:prefetch href={`/posts/${post.slug}`}>
      <div>
        <h2 class="font-black mb-1 text-3xl mt-5">
          {post.title}
        </h2>
        <div class="mb-4 text-accent uppercase text-sm font-bold">
          <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
          •
          <span>{post.readingTime.text}</span>
        </div>
      </div>
      <div class="all-prose">
        {@html `${post.html.slice(0,150)}...`}
      </div>
    </a>
  </article>
</EdgeGlow>
