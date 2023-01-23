<script>
  export let buttonText = ''
  export let open = true

  // custom slide animation
  const slide = (node, open) => {
    let initialHeight = node.offsetHeight
    node.style.height = open ? `auto` : '0px'
    node.style.overflow = 'hidden'
    let animation = node.animate(
      [{ height: '0px' }, { height: `${initialHeight}px` }],
      {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'both',
        direction: open ? 'reverse' : 'normal',
      }
    )
    animation.pause()
    animation.onfinish = ({ currentTime }) => {
      if (currentTime === 0) {
        animation.reverse()
        animation.pause()
      }
      node.dispatchEvent(new CustomEvent('animationEnd'))
    }
    return {
      update: () => {
        animation.currentTime ? animation.reverse() : animation.play()
      },
    }
  }
</script>

<section class="border not-prose">
  <button
    on:click={() => {
      open = !open
    }}
  >
    <div class="flex items-center text-left">
      <span style="margin:0 1rem;" class="transition" class:open>
        ▶
      </span>
      <p style="margin:1rem 0;">{buttonText}</p>
    </div>
  </button>
  <div use:slide={open}>
    <slot />
  </div>
</section>

<style>
  .open {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
