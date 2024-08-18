<script>
  import { DateUpdated, Small } from '$lib/components'
</script>

# My Todo List

<Small>
  Last updated: <DateUpdated date="2024-08-18" small="true" />
</Small>

My inbox is not my todo list! I'm going to keep this page updated with
what I'm working on and what I'm thinking about.

## Working on

- Continually making sure this site doesn't break on new Svelte 5
  releases.

## Thinking about

- LLM scraper honeypot to log LLM scrapes and identify new bot's to
  block. I got the idea from
  [darkvisitors.com](https://darkvisitors.com/docs/analytics)
  mentioned on the 404media podcast.
- Taking a look at
  [svelte-markdoc-preprocess](https://github.com/TorstenDittmann/svelte-markdoc-preprocess)
  for possible rewrite of this site.

## Done

- Moved my SvelteKit short URLs from using Upstash over to Turso,
  moved hosting from Vercel to my VPS.
