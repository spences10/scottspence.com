<script>
  import viewport from '$lib/use-viewport-action'

  export let height = '100px'
  export let width = '160px'
  const puns = [
    `Ok, well, now that's behind you maybe you'd like to share this?`,
    `Is that two cheeky for you?!`,
    `I know, what a half-arsed attempt at humour!`,
    `I've got some cheek making that crack!`,
    `Cool! You can leave that in the Rear-view now!`,
    `Like it? You can always take another crack at it?`,
    `Butt wait, there's more!`,
    `I'll understand if you think it didn't Butt the mustard!`,
    `Personally, I feel like this is a really half-assed attempt at humour.`,
    `Sorry if I'm being a smart ass.`,
    `Ok time to get stuck into the backend again instead of wasting my time writing bottom-drawer jokes.`,
    `I'm a little Behind on my jokes butt a well-Rounded Butt pun always beats a Crappy one.`,
  ]

  $: pun = randomPun()
  function randomPun() {
    pun = puns[Math.floor(Math.random() * puns.length)]
    return pun
  }

  let intersecting

  function customTransition(node, { delay, duration }) {
    return {
      delay,
      css: t => {
        return `
          opacity: ${t};
          transform: scale(${t});
        `
      },
    }
  }
</script>

<div
  use:viewport
  on:enterViewport={() => (intersecting = true)}
  on:exitViewport={() => (intersecting = false)}
>
  <aside class="mb-12 text-center">
    <p class="mb-6">
      Looks like you have reached the bottom of this page!
    </p>
    {#if intersecting}
      <div class="flex justify-center mb-12">
        <img
          src="https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614936696/scottspence.com/buttbutt.png"
          alt="a cheeky butt"
          {height}
          {width}
          class="h-full"
          transition:customTransition={{ delay: 200 }}
        />
      </div>
    {/if}
    <p class="mb-6">Bummer!</p>
    <p class="mb-6">{pun}</p>
    <button class="btn btn-xs" on:click={() => randomPun()}>
      pun me up
    </button>
  </aside>
</div>
