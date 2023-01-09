---
date: 2022-12-24
title: Goals for 2023
tags: ['career', 'learning', 'habits']
isPrivate: false
---

<script>
  import ProgressBar from '@lib/components/progress-bar.svelte'
</script>

For 2023 I'm going to note down my goals for the year. I'll take a
look at this quarterly and update it accordingly.

<div
  class="flex flex-col justify-center not-prose text-center border border-primary rounded-lg"
>
  <h2 class="text-2xl text-primary font-bold tracking-wide py-2">
    Total progress
  </h2>
  <div class="flex justify-center">
    <ProgressBar value="{6.2}" max="{59}" width="w-3/4" />
  </div>
</div>

<!--
Help organise 12 Svelte meetups 0
Speak at 4 Svelte meetups 0
Host 4 free Svelte community workshops 0
Host 4 paid Svelte workshops 0
Lose 15kg in weight from 117kg => 3.2
Release 4 video course on building with Svelte 0
Release 12 blog posts on building with Svelte 0
Build site skeleton site 1
Build auth feature 1
Build gated content feature 1
Deploy and market to the world 0
Total 59
Current 6.2
-->

## Be more active in the Svelte community

I'd like to keep up the consistency I had through 2022 with organising
monthy Svelte meetups and contributing to the Svelte community.

<ProgressBar
  label="Help organise 12 Svelte meetups"
  value={0}
  max={12}
  width="w-2/3"
/>

<ProgressBar
  label="Speak at 4 Svelte meetups"
  value={0}
  max={4}
  width="w-2/3"
/>

Host in person workshops both paid and free.

<ProgressBar
  label="Host 4 free Svelte community workshops"
  value={0}
  max={4}
  width="w-2/3"
/>

<ProgressBar
  label="Host 4 paid Svelte workshops"
  value={0}
  max={4}
  width="w-2/3"
/>

## Lose weight

I'd like to get lighter than I am currently (117kg), ideal body weight
would be 92kg but a healthy amount to lose would be around 15kg, so a
target body weight of 112kg.

<!-- started at 117, current 113.8 -->

<ProgressBar
  value={3.2}
  max={15}
  width="w-2/3"
  label="Lose 15kg in weight"
/>

## More consistent, free Svelte content

There's a load of great content out there on Svelte and I'd like to
add to that with my own content.

Now SvelteKit has hit v1 a lot of the content out there has been
invalidated and I'd like to update my content to reflect that in
written and video content.

<ProgressBar
  value={0}
  max={4}
  width="w-2/3"
  label="Release 4 video course on building with Svelte"
/>

<ProgressBar
  value={0}
  max={12}
  width="w-2/3"
  label="Release 12 blog posts on building with Svelte"
/>

## Host content on own platform as well as YouTube.

We all know a platform can move the goal posts at any time so I'd like
to have my own platform to host my content on.

<ProgressBar
  value={1}
  max={1}
  width="w-2/3"
  label="Build site skeleton site"
/>

<ProgressBar
  value={1}
  max={1}
  width="w-2/3"
  label="Build auth feature"
/>

<ProgressBar
  value={0}
  max={1}
  width="w-2/3"
  label="Build gated content feature"
/>

<ProgressBar
  value={0}
  max={1}
  width="w-2/3"
  label="Deploy and market to the world"
/>
