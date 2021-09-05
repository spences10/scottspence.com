<!-- <script context="module">
  // export const prerender = true
  export async function load({ fetch }) {
    const year = 2019
    const res = await fetch(`/github-contributions.json?year=${year}`)
    if (res.ok) {
      const data = await res.json()
      return {
        props: { data },
      }
    }
  }
</script> -->
