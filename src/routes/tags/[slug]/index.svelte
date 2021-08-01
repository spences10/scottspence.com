<script context="module">
  export async function load({ page }) {
    const { slug } = page.params
    return {
      status: 301,
      redirect: `/posts/${slug}`,
    }
  }
</script>
