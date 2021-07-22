<script>
  import { format } from 'date-fns'

  export let post
</script>

<article class="py-8 first:pt-0">
  <div>
    <h1 class="!mt-0 !mb-1">
      <a href={`/posts/${post.slug}`}>{post.title}</a>
    </h1>
    <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
    •
    <span>{post.readingTime.text}</span>
  </div>
  <div>{@html post.previewHtml}</div>
</article>
