<script lang="ts">
	let { data } = $props()
	const { posts, analytics } = data
</script>

<pre>{JSON.stringify(analytics, null, 2)}</pre>

<!-- {#each posts.posts as post, index}
  <p>{post.title}</p>
  <pre>{JSON.stringify(post, null, 2)}</pre>
{/each} -->

<pre>{JSON.stringify(posts, null, 2)}</pre>
this is the stats page, but there's nothing here
