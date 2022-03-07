<script>
  import { POPULAR_POSTS,SITE_LINKS,SOCIAL_LINKS } from '$lib/info'
  import Eye from '@lib/icons/eye.svelte'
  import { trackGoal } from 'fathom-client'
</script>

<footer class="footer p-10 bg-primary text-primary-content">
  <div>
    <span class="footer-title">Popular Posts</span>
    {#each POPULAR_POSTS as post}
      <a
        sveltekit:prefetch
        class="text-primary-content hover:opacity-50"
        href={post.slug}
      >
        {post.title}
        <span class="text-primary-content font-bold">
          <Eye />
          {post.views}
        </span>
      </a>
    {/each}
  </div>
  <div>
    <span class="footer-title">Site Links</span>
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
    <span class="footer-title">Socials</span>
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

