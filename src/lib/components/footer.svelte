<script>
  import { POPULAR_POSTS, SITE_LINKS, SOCIAL_LINKS } from '$lib/info'
  import Eye from '@lib/icons/eye.svelte'
  import { trackGoal } from 'fathom-client'
</script>

<footer class="footer p-10 bg-primary inset-0 relative z-10">
  <div class="">
    <div class="rounded-full overflow-hidden h-14 mb-8 w-14">
      <img
        src="/mug-face.png"
        alt="scott profile"
        class="object-cover"
      />
    </div>
    <p class="text-primary-content">
      Built with SvelteKit, MDSveX and Tailwind
    </p>
    <p class="text-primary-content text-lg">
      Coding code since Cody McCoderson said code! Check the about
      section for more.
    </p>
  </div>
  <div>
    <span class="footer-title text-secondary-content"
      >Popular Posts</span
    >
    {#each POPULAR_POSTS as post}
      <a
        sveltekit:prefetch
        href={`/${post.slug}`}
        class="text-primary-content hover:opacity-50"
      >
        {post.title}
        <span class="text-primary-content font-bold"
          ><Eye /> {post.views}</span
        >
      </a>
    {/each}
  </div>
  <div>
    <span class="footer-title text-primary-content">Site Links</span>
    {#each SITE_LINKS as link}
      <a
        sveltekit:prefetch
        href={`/${link.slug}`}
        on:click={() => trackGoal(link.id, 0)}
        class="text-primary-content hover:opacity-50"
      >
        {link.title}
      </a>
    {/each}
  </div>
  <div>
    <span class="footer-title text-primary-content">Socials</span>
    {#each SOCIAL_LINKS as social}
      <a
        class="text-primary-content hover:opacity-50"
        href={social.link}
        target="_blank"
        rel="noopener"
      >
        {social.title}
      </a>
    {/each}
  </div>
</footer>
