<script context="module">
  export async function load({ page }) {
    try {
      const Post = await import(`../../copy/about.md`)
      return {
        props: {
          Post: Post.default,
        },
      }
    } catch (e) {
      return {
        status: 404,
        error: 'Uh oh!',
      }
    }
  }
</script>

<script>
  export let Post
</script>

<Post />
