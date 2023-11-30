<script lang="ts">
  import { visitors_store, type VisitorEntry } from '$lib/stores'
  import * as Fathom from 'fathom-client'
  import CurrentVisitorsData from './current-visitors-data.svelte'

  let is_hovering = false
  let base_cloudinary_url =
    'https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1691271318/scottspence.com/site-assets/'
  let ScottFace = `${base_cloudinary_url}scott-mug-face-no-bg.png`
  let ScottMugFace = `${base_cloudinary_url}scott-mug-face.png`

  let current_visitor_data: VisitorEntry | undefined | number

  $: {
    if ($visitors_store && $visitors_store.visitor_data) {
      current_visitor_data = $visitors_store.visitor_data.reduce(
        (total, visitor) => total + visitor.recent_visitors,
        0,
      )
    }
  }

  let show_current_visitor_data = false
</script>

<div class="mb-4 relative lg:-mx-40 lg:px-8 xl:-mx-64 2xl:-mx-60">
  <div class="hero">
    <div class="flex-col p-0 hero-content lg:flex-row-reverse">
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        src={is_hovering ? ScottFace : ScottMugFace}
        alt="Cartoon face Scott"
        class="rounded-full max-w-sm shadow-xl w-1/2 lg:w-full max-h-96 max-w-96"
        on:mouseover={() => (is_hovering = !is_hovering)}
        on:mouseout={() => (is_hovering = !is_hovering)}
      />
      <div class="all-prose lg:mr-28">
        <h1 class="font-black -mb-5 text-5xl">
          <span class="block">Scott Spence</span>
          <span
            class="bg-clip-text bg-gradient-to-b from-primary to-secondary text-transparent block"
          >
            Hello World!
          </span>
        </h1>
        <p class="mb-5">
          This is my blog where I write about many things, including,
          but not limited to Svelte, SvelteKit, JavaScript, Tailwind
          and many more web dev related topics.
        </p>
        <p class="mb-5">
          Check out that massive picture of my <a
            href="https://www.cockneyrhymingslang.co.uk/slang/boat_race"
            target="_blank"
            rel="noopener noreferrer"
          >
            boat race
          </a>! What do you think? If you want to crack on then check
          out some of the stuff I'm writing about on the
          <a href="/posts">posts page</a>.
        </p>
        <p class="mb-5">
          You can carry on scrolling for a bit more info about me if
          you like.
        </p>
        <p class="mb-10">
          Or if you want to get in touch, feel free to reach out to
          me...
        </p>
        <a
          href="/contact"
          on:click={() => Fathom.trackEvent(`contact button click`)}
          class="btn btn-md w-full lg:btn-lg btn-primary text-primary-content hover:text-primary-content shadow-xl rounded-box mb-5"
        >
          Get in Touch
        </a>
        {#if current_visitor_data}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span
            on:mouseenter={() => (show_current_visitor_data = true)}
            on:mouseleave={() => (show_current_visitor_data = false)}
            class="cursor-pointer inline-block"
          >
            <p
              class="tracking-wide bg-secondary text-secondary-content mt-2 px-4 py-2 shadow-xl rounded-box text-sm"
            >
              There's currently
              <span class="font-bold">
                {current_visitor_data}
              </span>
              live {current_visitor_data === 1
                ? 'visitor'
                : 'visitors'}
            </p>
            {#if show_current_visitor_data}
              <CurrentVisitorsData />
            {/if}
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>
