<script>
  import { format } from 'date-fns'

  export let post
</script>

<article
  class="mb-5 p-5 transition card bordered hover:text-accent-focus first:pt-0"
>
  <a href={`/posts/${post.slug}`}>
    <div>
      <h2 class="font-black mb-1 text-3xl">
        {post.title}
      </h2>
      <div class="mb-4 text-accent uppercase text-sm font-bold">
        <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
        •
        <span>{post.readingTime.text}</span>
      </div>
    </div>
    <div class="all-prose">
      {@html post.previewHtml}
    </div>
  </a>
</article>
