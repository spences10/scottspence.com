<script>
  import { DateUpdated, Small } from '$lib/components'
</script>

<!-- cSpell:ignore vulf salma darkvisitors markdoc findtechconferences -->

# My Todo List

<Small>
  Last updated: <DateUpdated date="2024-11-09" small="true" />
</Small>

My inbox is not my todo list! I'm going to keep this page updated with
what I'm working on and what I'm thinking about.

## Working on

- Building [skykit.blue](https://skykit.blue) 😅 A stats page for
  Bluesky users.

- Continually making sure this site doesn't break on new Svelte 5
  releases.

- LLM scraper honeypot to log LLM scrapes and identify new bot's to
  block. I got the idea from
  [darkvisitors.com](https://darkvisitors.com/docs/analytics)
  mentioned on the 404media podcast.

- Implementing [Svead](https://svead.pages.dev) throughout this site.

- [fit-forge](https://fit-forge.pages.dev)

- [rinku-cloud](https://rinku.cloud)

- [findtechconferences.com](https://findtechconferences.com/)

## Thinking about

- Taking my Twitter data, embedding it with Voyage AI, using the
  embeddings in a Turso (libsql) database with vectors, and then using
  the embeddings to power a search functionality on a site.

- Taking a look at
  [svelte-markdoc-preprocess](https://github.com/TorstenDittmann/svelte-markdoc-preprocess)
  for possible rewrite of this site.

- Checking out the [Vulf](https://ohnotype.co/fonts/vulf) coding font.

- Taking more time to get familiar with
  [cURL](https://www.youtube.com/watch?v=APtOavXTv5M)

- Looking into i18n details from this
  [post](https://x.com/joshwcomeau/status/1759616073773543485?s=46&t=4RSOl8kQCdkHm0U5FcdeaA)
  from Josh Comeau: "⚠️ Friendly reminder: If you work on
  internationalization, please do not use the user's location to
  decide what language to serve your content in. Use the
  "Accept-Language" header instead. Users can't set their IP address,
  but they can set their OS' language setting."

- Styling RSS feeds! Salma created a
  [post](https://github.com/whitep4nth3r/mk2-p4nth3rblog/blob/main/src/_css/rss-style.xsl)
  about it.

- Yet another email
  [SES service](https://docs.useplunk.com/guides/setting-up-automation)
  to check out.

- [Svelte local storage runes](https://www.reddit.com/r/sveltejs/s/mk6d48xK7c)

## Done

- Moved my SvelteKit short URLs from using Upstash over to Turso,
  moved hosting from Vercel to my VPS.

- Updating Svead to use a Schema ORG JSON-LD component, like in
  [svelte-meta-tags](https://github.com/oekazuma/svelte-meta-tags).

- Better analytics from the SvelteKit short URLs project to give click
  referrers.

- Added related posts to the bottom of each post using Turso with
  vector search via Voyage AI embeddings.

- cURL tasks using Deno on a VPS.
