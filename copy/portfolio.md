<script>
  import DateUpdated from '$lib/components/date-updated.svelte'
  import Small from '$lib/components/small.svelte'
  import YouTube from '$lib/components/youtube.svelte'
  import NewsletterSignup from '$lib/components/newsletter-signup.svelte'
  import GithubContributions from '@lib/components/github-contributions.svelte'

  export let contributions
  let years = [2017, 2018, 2019, 2020, 2021, 2022]
  let year = 2020

  const getContributions = async year => {
    const res = await fetch(`/github-contributions.json?year=${year}`)
    if (res.ok) {
      contributions = await res.json()
    }
    return await contributions
  }
  $: getContributions(year)
</script>

# Portfolio

<Small>
  Last updated: <DateUpdated date="2022-03-05" small="true" />
</Small>

🚧**This page is currently under construction.**🚧

There'll be some cool SvelteKit features added here to get my GitHib
user information and show it in a graph or two.

Here's a Svelte Cubed playground of my GitHub contributions for the
last six years, you can play around with it with the mouse or the
controls here.

<span>Pick a year: <select bind:value={year}>

  <option disabled selected>Year</option>
  {#each years as year}
    <option value={year}>{year}</option>
  {/each}
</select>
</span>

<GithubContributions {contributions} />

I've added some of my recent work here if you would like to check it
out.

## Recent work

Most recent work from me would include a SvelteKit crash course over
on YouTube.

<YouTube youTubeId='zH2qG9YwN3s'/>

A complete guide for creating your own developer [portfolio with
SvelteKit and GraphCMS] over on the freeCodeCamp news publication.

I conducted a workshop at Jamstack conf to "[Build with SvelteKit and
GraphQL]".

There's also a Jamstack exploreres guide on "[Building with SvelteKit
and GraphCMS]" you can check out for free!

A walkthrough of all the example projects in the [GraphCMS Examples
Monorepo]. Check out the playlist on the GraphCMS YouTube account. 👇

<YouTube listId='PL5SvzogSTpeH1Szqw4tPi9ZfgXDbY8GU-'/>

There's also the build your own timeline with SvelteKit and GraphCMS,
you can check out the full guide over on the [GraphCMS blog].

## Get the news first

If you're interested in knowing exactly when that'll be available you
can sign up the newsletter below as my newsletter subscribers will be
the first to know.

<NewsletterSignup />

<!-- Links -->

[graphcms examples monorepo]:
  https://github.com/GraphCMS/graphcms-examples
[graphcms blog]:
  https://graphcms.com/blog/build-a-personal-timeline-with-graphcms-and-sveltekit
[portfolio with sveltekit and graphcms]:
  https://www.freecodecamp.org/news/build-your-developer-portfolio-from-scratch-with-sveltekit-and-graphcms/
[build with sveltekit and graphql]:
  https://scottspence.com/speaking#jamstack-conf-workshop---2021-october
[building with sveltekit and graphcms]:
  https://scottspence.com/speaking#jamstack-explorers---2021-october
