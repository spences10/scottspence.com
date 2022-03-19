---
date: 2022-03-18
title: Getting Started with KitQL and GraphCMS
tags: ['svelte', 'sveltekit', 'graphql', 'graphcms']
isPrivate: true
---

KitQL is a GraphQL client for Svelte. It is a simple way to query
GraphQL APIs. I've been using it in a couple of projects now and want
to share what I have learned. What better wat to do that than the
(now) classic re-reaction of the GraphCMS blog template with
SvelteKit.

First up I want to thank the creator of KitQL for his work. Jean-Yves
Couët (or [JYC]) has done a great job with KitQL and the additional
tooling he's created for use in SvelteKit.

He's also done a great introductory video over on YouTube with an
[explanation video for setting up KitQL]. The API has changed a bit
since the video so I'll go over how to use that here.

## What's in the box?

KitQL uses the [GraphQL Code Generator] to generate typed queries,
mutations and subscriptions. This means that you can use the built in
VS Code intellisense to find fields in queries.

[GraphQL VS Code extension]

## Let's get set up!

I have a couple of other projects named
`x-with-sveltekit-and-graphcms` where `x` is the GraphQL client being
used.

This one will be the same as the others except using KitQL for the
GraphQL client.

I'll start by creating the project with the `npm init` command and
pick the follwing options:

```text
➜ npm init svelte@next kitql-with-sveltekit-and-graphcms

✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

<!-- Links -->

[graphql code generator]: https://www.graphql-code-generator.com/
[graphql vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
[explanation video for setting up kitql]:
  https://www.youtube.com/watch?v=6pH4fnFN70w
[jyc]: https://twitter.com/jycouet
