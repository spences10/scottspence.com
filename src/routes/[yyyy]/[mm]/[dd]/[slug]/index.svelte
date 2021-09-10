<!-- 
  Redirects from my old blog filing structure yyyy/mm/dd/post-title
  to posts/post-title thanks to rodneylab for the example 👇
  https://github.com/rodneylab/sveltekit-blog-mdx/blob/dev__redirect/src/routes/%5Byear%5D/%5Bmonth%5D/%5Bday%5D/%5Bslug%5D/index.svelte
 -->
<script context="module">
  export const load = async ({ page }) => {
    const { slug } = page.params
    return {
      status: 301,
      redirect: `/posts/${slug}`,
    }
  }
</script>
