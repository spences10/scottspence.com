<script>
  import { trackGoal } from 'fathom-client'
</script>

<div
  class="mb-4 relative lg:-mx-40 lg:mb-44 lg:px-8 xl:-mx-64 xl:mb-[17rem] 2xl:-mx-60 2xl:mb-72"
>
  <div class="hero">
    <div class="flex-col p-0 hero-content lg:flex-row-reverse">
      <img
        src="/mug-face.png"
        alt="Cartoon face Scott"
        class="rounded-full max-w-sm shadow-xl w-1/2 lg:w-full"
      />
      <div class="all-prose lg:mr-28">
        <h1 class="font-bold mb-5 text-5xl">
          <span class="block">Scott Spence</span>
          <span
            class="bg-clip-text bg-gradient-to-b from-primary to-secondary text-transparent block"
            >Hello World!</span
          >
        </h1>
        <p class="mb-5">
          This is my blog where I write about many things, including,
          but not limited to JavaScript, React, Gatsby, Tailwind,
          Svelte and many more web dev related topics.
        </p>
        <p class="mb-5">
          Check out that massive picture of my <a
            href="https://www.cockneyrhymingslang.co.uk/slang/boat_race"
            target="_blank"
            rel="noopener noreferrer">boat race</a
          >! What do you think? If you want to crack on then check out
          some of the stuff I'm writing about on the
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
          on:click={() => trackGoal(`T2YXL68Y`)}
          class="btn btn-md w-full lg:btn-lg btn-primary text-primary-content mb-5 hover:text-primary-content"
          >Get in Touch</a
        >
      </div>
    </div>
  </div>

  <!-- chevron down animated!! -->
  <a href="#hi-im-scott" aria-label="scroll down for more">
    <svg
      xmlns="https://www.w3.org/2000/svg"
      class="m-auto h-8 my-6 animate-bounce w-8 block lg:mt-20"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
        clip-rule="evenodd"
      />
    </svg>
  </a>
</div>
