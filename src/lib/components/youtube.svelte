<script>
  export let width
  export let height
  export let youTubeId
  export let autoPlay
  export let startTime
</script>

<iframe
  {width}
  {height}
  class="youtube-mdx-embed"
  title={`youTube-${youTubeId}`}
  src={`https://www.youtube-nocookie.com/embed/${youTubeId}?&autoplay=${autoPlay}&start=${startTime}`}
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }}
/>
