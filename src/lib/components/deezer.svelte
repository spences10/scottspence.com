<script>
  import GeneralObserver from './general-observer.svelte'

  export let theme = 'auto'
  export let frameSrc = ''
  export let height = '300px'
  export let width = '100%'
</script>

<GeneralObserver {height} {width}>
  <iframe
    title="deezer-widget"
    src={`https://widget.deezer.com/widget/${theme}/${frameSrc}`}
    {width}
    {height}
    frameborder="0"
    allowtransparency="true"
    allow="encrypted-media; clipboard-write"
  />
</GeneralObserver>
