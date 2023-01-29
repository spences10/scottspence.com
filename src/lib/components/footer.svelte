<script>
  import { SITE_LINKS, SOCIAL_LINKS } from '$lib/info'
  import Eye from '@lib/icons/eye.svelte'
  import { name } from '@lib/info'
  import { number_crunch } from '@lib/utils'
  import { trackGoal } from 'fathom-client'

  export let data
  let { post_analytics } = data
</script>

<footer class="footer p-10 bg-primary text-primary-content">
  <div>
    <span class="footer-title">Popular Posts</span>
    {#each post_analytics as post}
      <p>
        <a
          class="text-primary-content hover:opacity-50"
          href={`https://scottspence.com${post.pathname}`}
        >
          {post.title}
        </a>
        <span
          class="text-primary-content font-bold tooltip relative group cursor-pointer"
          data-tip={`
            Visits: ${number_crunch(post.visits)},
            Uniques: ${number_crunch(post.uniques)},
            Pageviews: ${number_crunch(post.pageviews)}
          `}
        >
          <Eye />
          {number_crunch(post.pageviews)}
        </span>
      </p>
    {/each}
  </div>
  <div>
    <span class="footer-title">Site Links</span>
    {#each SITE_LINKS as link}
      <a
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
    <a rel="me" href="https://mas.to/@spences10">Mastodon</a>
    {#each SOCIAL_LINKS as social}
      <a
        class="text-primary-content hover:opacity-50"
        href={social.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {social.title}
      </a>
    {/each}
  </div>
</footer>
<div class="divider bg-primary m-0" />
<div class="bg-primary text-primary-content">
  <p class="text-center py-4">
    Copyright &copy; 2017 - {`${new Date().getFullYear()}`} - All rights
    reserved
    {name}
  </p>
</div>
