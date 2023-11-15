<script lang="ts">
  import { differenceInDays, format } from 'date-fns'
  import EdgeGlow from './edge-glow.svelte'

  export let post: Post
</script>

<EdgeGlow>
  <article
    class="bg-base-100 mb-10 p-5 transition card hover:text-accent first:pt-0"
  >
    <a href={`/posts/${post.slug}`}>
      <div>
        <h2 class="font-black mb-1 text-3xl mt-5">
          {post.title}
        </h2>
        <div class="mb-4 text-accent uppercase text-sm font-bold">
          <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
          &bull;
          <span>{post.readingTime.text}</span>
          {#if differenceInDays(new Date(), new Date(post.date)) < 31}
            <span
              class="badge bg-primary hover:bg-secondary hover:text-secondary-content text-primary-content"
            >
              new
            </span>
          {/if}
        </div>
      </div>
      <div class="all-prose">
        {@html post.previewHtml}
      </div>
    </a>
  </article>
</EdgeGlow>
