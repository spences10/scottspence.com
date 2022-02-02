---
date: 2022-01-15
title: Use Houdini with Svelte
tags: ['sveltekit', 'how-to', 'graphql', 'graphcms']
isPrivate: true
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Houdini! The disappearing GraphQL client! I've used Houdini for a
couple of projects now and I think it's great!

I first came across this post from the creator of Houdini ([Alec
Aivazis]) over on Dev.to for [Building an Application with GraphQL and
SvelteKit]. A great post on getting set up with Houdini using the [The
Rick and Morty API].

You can see the [example I made] following along over on GitHub and
the [example site] deployed to Vercel.

Alec's example although a great start didn't cover some parts of using
the client I was wanting to do with the Rick and Morty example like
passing variables to queries on routes which I worked out in the
example I made.

In this how to, I'll be making the standard blog example using the
GraphCMS blog starter! If you just want to check out the code you can
find the [blog example using Houdini] over on GitHub.

I'll be creating the backend for the project with the GraphCMS blog
template, check out the video here on how to get started with that!

<YouTube youTubeId='CUudpo8n2FA'/>

I'll be using [pnpm] for my package management, you can do what you
please with your preferred package manager. (pnpm, npm or yarn)

```bash
# create new svelte project named houdini-with-sveltekit-and-graphcms
pnpm init svelte@next houdini-with-sveltekit-and-graphcms
```

The CLI will prompt for some options, here's what I've picked:

```bash
Which Svelte app template? › Skeleton project
Use TypeScript? › No
Add ESLint for code linting? › No
Add Prettier for code formatting? › Yes
```

Once it's finished I can change directory into the project install
dependencies

```bash
# change directory into the newly created project
cd houdini-with-sveltekit-and-graphcms
# install dependencies
pnpm install
# optional init git repo
git init && git add -A && git commit -m "Initial commit"
```

<!-- Links -->

[alec aivazis]: https://github.com/AlecAivazis
[building an application with graphql and sveltekit]:
  https://dev.to/alecaivazis/building-an-application-with-graphql-and-sveltekit-3heb
[the rick and morty api]: https://github.com/afuh/rick-and-morty-api
[short post on it here]: https://afuh.dev/the-rick-and-morty-api
[example i made]:
  https://github.com/spences10/houdini-with-svelte-example
[example site]: https://houdini-with-svelte-example.vercel.app/
[blog example using houdini]:
  https://github.com/spences10/houdini-with-sveltekit-and-graphcms
[pnpm]: https://pnpm.io/
