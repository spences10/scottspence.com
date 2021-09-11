<script>
  import GeneralObserver from './general-observer.svelte'

  export let spotifyLink = ''
  export let width = 320
  export let height = 380
</script>

<GeneralObserver {height} {width}>
  <iframe
    data-testid="spotify"
    title={`spotify-${spotifyLink}`}
    class="spotify-sveltekit-embed"
    src={`https://open.spotify.com/embed/${spotifyLink}`}
    {width}
    {height}
    frameBorder="0"
    allow="encrypted-media"
  />
</GeneralObserver>
