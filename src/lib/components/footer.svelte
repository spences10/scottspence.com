<script>
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
            <svg
              role="img"
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              class="fill-current text-primary-content hover:text-primary-focus"
            >
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </a>

          <a
            href="https://ss10.dev/github"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">GitHub</span>
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="https://www.w3.org/2000/svg"
              height="20"
              width="20"
              class="fill-current text-primary-content hover:text-primary-focus"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
          </a>

          <a
            href="https://ss10.dev/spotify"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">Spotify</span>
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="https://www.w3.org/2000/svg"
              height="20"
              width="20"
              class="fill-current text-primary-content hover:text-primary-focus"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
              />
            </svg>
          </a>

          <a
            href="https://ss10.dev/yt"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">YouTube</span>
            <svg
              role="img"
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              class="fill-current text-primary-content hover:text-primary-focus"
            >
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
          </a>

          <a
            href="https://ss10.dev/twitch"
            target="_blank"
            rel="noopener"
          >
            <span class="sr-only">Twitch</span>
            <svg
              role="img"
              xmlns="https://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              class="fill-current text-primary-content hover:text-primary-focus"
            >
              <path
                d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
              />
            </svg>
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
