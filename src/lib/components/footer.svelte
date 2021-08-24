<script>
  import GitHub from '$lib/icons/git-hub..svelte'
  import Spotify from '$lib/icons/spotify.svelte'
  import Twitch from '$lib/icons/twitch.svelte'
  import Twitter from '$lib/icons/twitter.svelte'
  import YouTube from '$lib/icons/you-tube.svelte'
  import { POPULAR_POSTS, SITE_LINKS } from '$lib/info'
  import { trackGoal } from 'fathom-client'
</script>

<footer
  class="bg-primary inset-0 relative z-10"
  aria-labelledby="footerHeading"
>
  <h3 id="footerHeading" class="sr-only">Footer</h3>
  <div class="mx-auto max-w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
    <div class="xl:grid xl:gap-8 xl:grid-cols-2">
      <div class="space-y-8 xl:col-span-1">
        <div class="">
          <div class="rounded-full overflow-hidden h-14 mb-8 w-14">
            <img
              src="/mug-face.png"
              alt="scott profile"
              class="object-cover"
            />
          </div>
        </div>
        <p class="text-left text-primary-content">
          Built with SvelteKit, MDSveX and Tailwind
        </p>
        <p class="text-left text-primary-content">
          Coding code since Cody McCoderson said code! Check the{' '}
          <a href="/about">about</a> section for more.
        </p>
        <div class="flex space-x-6">
          <a
            href="https://ss10.dev/twitter"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">Twitter</span>
            <Twitter />
          </a>

          <a
            href="https://ss10.dev/github"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">GitHub</span>
            <GitHub />
          </a>

          <a
            href="https://ss10.dev/spotify"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">Spotify</span>
            <Spotify />
          </a>

          <a
            href="https://ss10.dev/yt"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">YouTube</span>
            <YouTube />
          </a>

          <a
            href="https://ss10.dev/twitch"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">Twitch</span>
            <Twitch />
          </a>
        </div>
      </div>
      <div class="mt-12 grid gap-8 grid-cols-1 xl:mt-0 xl:col-span-1">
        <div class="md:grid md:gap-8 md:grid-cols-2">
          <div>
            <h3
              class="font-semibold text-lg text-primary-content mb-3 tracking-wider uppercase"
            >
              Popular posts
            </h3>
            <ul class="list-none space-y-3">
              {#each POPULAR_POSTS as post}
                <li>
                  <a
                    sveltekit:prefetch
                    href={`/${post.slug}`}
                    class="text-primary-content hover:opacity-50"
                  >
                    {post.title}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          <div class="mt-12 md:mt-0">
            <h3
              class="font-semibold text-lg text-primary-content mb-3 tracking-wider uppercase"
            >
              Links
            </h3>
            <ul class="space-y-3">
              {#each SITE_LINKS as link}
                <li>
                  <a
                    sveltekit:prefetch
                    href={`/${link.slug}`}
                    on:click={() => trackGoal(link.id)}
                    class="text-primary-content hover:opacity-50"
                  >
                    {link.title}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 mt-12 pt-8">
      <p class="text-primary-content mb-12 lg:mb-0 xl:text-center">
        &copy; {`${new Date().getFullYear()}`} Scott Spence. All rights
        reserved, whatever that means. 🤷‍♀️
      </p>
    </div>
  </div>
</footer>
