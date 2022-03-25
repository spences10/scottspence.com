---
date: 2022-03-18
title: Getting Started with KitQL and GraphCMS
tags: ['svelte', 'sveltekit', 'graphql', 'graphcms']
isPrivate: true
---

KitQL is a GraphQL client for Svelte. It is a set of tools to help you
query GraphQL APIs. I've been using it in a couple of projects now and
want to share what I have learned. What better wat to do that than the
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

## Let's get set up!

If you haven't got the [GraphQL VS Code extension] mentioned in JYC's
video installed go install that for the ability to run queries in VS
Code.

I have a couple of other projects with this naming convention
`x-with-sveltekit-and-graphcms` where `x` is the GraphQL client being
used. So the projects are identical bar the client used and in this
case with KitQL being a TypeScript tool I'll be using TypeScript in
place of JavaScript.

## Create a new project

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

I'll follow the rest of the steps from the CLI output to get set up!

```text
Next steps:
  1: cd kitql-with-sveltekit-and-graphcms
  2: npm install (or pnpm install, etc)
  3: git init && git add -A && git commit -m "Initial commit" (optional)
  4: npm run dev -- --open
```

I'm using `pnpm` in these examples.

Create a `.env` file for my GraphCMS content API endpoint.

```bash
touch .env
```

## Install dependencies and configure

Then I'll need to install KitQL and the JavaScript implementation of
GraphQL.

```bash
pnpm i -D @kitql/all-in graphql
```

Create a `.graphqlrc.yaml` file:

```bash
touch .graphqlrc.yaml
```

I've taken the config for the file here from the [KitQL all-in] docs.
To be able to do code gen on this there needs to be a schema for use
in the `.graphqlrc.yaml` file. The schema can be either a local file
or a remote URL, I'm pointing this to the public content API of the
GraphCMS blog template.

```yaml
projects:
  default:
    schema: https://api.graphcms.com/v2/projectid/master
    documents:
      - '**/*.gql'
    extensions:
      endpoints:
        default:
          url: https://api.graphcms.com/v2/projectid/master
      codegen:
        generates:
          ./src/lib/graphql/_kitql/graphqlTypes.ts:
            plugins:
              - typescript
              - typescript-operations
              - typed-document-node
              - typescript-document-nodes

          ./src/lib/graphql/_kitql/graphqlStores.ts:
            plugins:
              - '@kitql/graphql-codegen'
            config:
              importBaseTypesFrom: $lib/graphql/_kitql/graphqlTypes

        config:
          useTypeImports: true
```

Then, there's the `sveltekit.config.js` file. In here I'll need to add
and configure the `vite-plugin-watch-and-run`, take note here if
you're not using `pnpm` you'll need to change the `run` command.

This plugin is really handy, with this configuration it will watch for
any changes to GraphQL files and then run a `npm` script.

```js
import watchAndRun from '@kitql/vite-plugin-watch-and-run'
import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    vite: {
      plugins: [
        watchAndRun([
          {
            watch: '**/*.(gql|graphql)',
            run: 'pnpm run gen',
          },
        ]),
      ],
    },
  },
}

export default config
```

Now that `pnpm run gen` is added to `vite-plugin-watch-and-run` and
being called each time there's a change to any GraphQL files, I'll
need to add it to the scripts in the `package.json` file.

```json
"scripts": {
  "prepare": "pnpm run gen",
  "dev": "svelte-kit dev --port 3777",
  "gen": "graphql-codegen --config ./.graphqlrc.yaml",
},
```

Because I'm using `pnpm` I'll also need to amend the `.npmrc` file:

```diff
-engine-strict=true
+save-exact=true
+node-linker=hoisted
```

Alright! Nearly done!

If I run the dev script (`pnpm run dev`) command now (which will call
the `gen` script with `vite-plugin-watch-and-run`) I'll get some error
output from `graphql-codegen` because I've not created any GraphQL
queries!

I'll create that folder structure now, note the `-p` flag will create
parent folders as well. So this command creates the `lib`, `graphql`
and `_kitql` folders.

```bash
mkdir src/lib/graphql/_kitql -p
```

In the `src/lib/graphql` folder I'll create an `all-posts.gql` file,
this is to list all the posts in the blog on the index page:

```gql
query AllPosts {
  posts {
    title
    slug
    date
    excerpt
    tags
    coverImage {
      url(
        transformation: {
          image: { resize: { fit: clip, height: 369, width: 656 } }
        }
      )
    }
  }
}
```

Now with the dev script running `vite-plugin-watch-and-run` will do
it's thing and run the `gen` script. This creates the
`graphqlStores.ts` and `graphqlTypes.ts` files in the `_kitql` folder.

Taking a look at the `graphqlStores.ts` file now I can see that there
is a function for `KQL_AllPostsStore()` which exports `KQL_AllPosts`.

The function has all the methods on it I'll need for working with the
data.

## Additional config for Tailwind

The rest of the code examples will be using Tailwind. If you're
follwing along and you're not into Tailwind you can skip this bit.

Don't like Tailwind? That's cool, you do you. 😊 It's not relevant to
this example, really. I do want this be a guide you can follow to have
the same result as what I have put on GitHub. If you only want to
check out the code there's a link at the end of the post. 👍

```bash
# install and config tailwind
npx svelte-add@latest tailwindcss
# add typography and daisyUI
pnpm i -D @tailwindcss/typography daisyui
```

The Typography and daisyUI plugins are added to the
`tailwind.config.cjs` file:

```js
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: null,
          },
        },
      },
    },
  },

  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

module.exports = config
```

## Create KitQL client

Now I can create the KitQL client to start querying data. Create the
`.ts` file for it first:

```bash
touch src/lib/graphql/kitQLClient.ts
```

Then I'll add the following configuration to the `kitQLClient.ts`
file:

```ts
import { KitQLClient } from '@kitql/client'
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_API

export const kitQLClient = new KitQLClient({
  url: GRAPHQL_ENDPOINT as string,
  credentials: 'omit',
  headersContentType: 'application/json',
  logType: ['client', 'server', 'operationAndvariables'],
})
```

## Use queried data from `graphqlStores`

Now for the home page (`src/routes/index.svelte`) I can use the
`KQL_AllPosts` store and use the `query` method.

In a SvelteKit load function I can `await` the query for `AllPosts`
and return an empty object from the load function. It's empty because
once the data has been fetched before the page loads it's added to a
Svelte store for use in the page.

```svelte
<script lang="ts" context="module">
  import { KQL_AllPosts } from '$lib/graphql/_kitql/graphqlStores'

  export const load = async ({ fetch }) => {
    await KQL_AllPosts.query({ fetch })
    return {}
  }
</script>
```

Once the page has loaded I can subscribe (referencing the store value
with the `$` ) to the `KQL_AllPosts` store to get the data.

```svelte
<script lang="ts">
  let posts = $KQL_AllPosts.data?.posts
</script>
```

I can now use that in a Svelte each expression to render the posts.
This is with Tailwind and daisyUI classes.

```svelte
{#each posts as { title, slug, excerpt, coverImage, tags }}
  <div class="card text-center shadow-2xl mb-20">
    <figure class="">
      <img
        class=""
        src={coverImage.url}
        alt={`Cover image for ${title}`}
      />
    </figure>
    <div class="card-body prose">
      <h2 class="title">{title}</h2>
      <p>{excerpt}</p>
      <div class="flex justify-center mb-5 space-x-2">
        {#each tags as tag}
          <span class="badge badge-primary">{tag}</span>
        {/each}
      </div>
      <div class="justify-center card-actions">
        <a
          sveltekit:prefetch
          href={`/posts/${slug}`}
          class="btn btn-outline btn-primary">Read &rArr;</a
        >
      </div>
    </div>
  </div>
{/each}
```

Sweet! That's the index page rendering out all the posts!

I'll now concentrate on creating the `src/routes/posts/[slug].svelte`
file so clicking the link on the index page will take you to the that
post.

## Passing GraphQL variables

So, clicking a link on the index page will give a 404 because the
route for it doesn't exist yet. That page is going to need the
specific data for that post. So I'm going to want to create a GraphQL
query for that post passing in the `${slug}` as a variable to query
on.

I'll make the query file first, via bash:

```bash
touch src/lib/graphql/get-post.gql
```

Then I'll add the following to the `get-post.gql` file:

```graphql
query GetPost($slug: String!) {
  post(where: { slug: $slug }) {
    title
    date
    tags
    author {
      name
      authorTitle: title
      picture {
        url(
          transformation: {
            image: { resize: { fit: clip, height: 50, width: 50 } }
          }
        )
      }
    }
    content {
      html
    }
    coverImage {
      url
    }
  }
}
```

Now I've created that query `vite-plugin-watch-and-run` will will do
it's thing (as I have the dev server running) and generate the store
and types for that query.

This query is expecting the `$slug` variable, I'll need to get that
from the `context` in the load function of the `[slug].svelte` file.
Which doesn't exist yet.

Soooo, another bash command or two to create the folder and file for
the posts route.

```bash
# make the posts folder
mkdir src/routes/posts
# create the /posts/[slug].svelte file
touch src/routes/posts/[slug].svelte
```

I'll break down the several parts of the `posts/[slug].svelte` file
here, so first up I'll need to get that `slug` variable from the
`context` in the load function of the `[slug].svelte` file. I'll just
go straight in here and destructure the `params` object (which has the
`slug` value) and also destructure `fetch` for KitQL to use:

```svelte
<script context="module">
  import { KQL_GetPost } from '$lib/graphql/_kitql/graphqlStores'
  export const load = async ({ params, fetch }) => {
    const { slug } = params
    if (slug) await KQL_GetPost.query({ fetch, variables: { slug } })
    return {}
  }
</script>
```

I'm importing the `KQL_GetPost` store here, and then I'm calling the
`.query` passing in the `fetch` and `variables` object.

Using `context="module"` means that code will run before the page
loads.

When the page loads I will be able to subscribe to the `KQL_GetPost`
store in some `<script>` tags and get the data I need out of the store
to use in the page.

```svelte
<script lang="ts">
  let post = $KQL_GetPost.data?.post
  const {
    title,
    date,
    tags,
    author: { name, authorTitle, picture },
    content: { html },
    coverImage,
  } = post
</script>
```

⚠️ **codewall incoming!** ⚠️

So no I have all I need to render out the post from the `KQL_GetPost`
store.

```svelte
<svelte:head>
  <title>KitQL with GraphCMS | {title}</title>
</svelte:head>

<div class="sm:-mx-5 md:-mx-10 lg:-mx-20 xl:-mx-38 mb-5">
  <img
    src={coverImage.url}
    alt={`Cover image for ${title}`}
    class=""
  />
</div>

<h1 class="text-4xl font-semibold mb-5">{title}</h1>

<a href="/" class="inline-flex items-center mb-3">
  <img
    src={picture.url}
    alt={name}
    class="w-12 h-12 rounded-full flex-shrink-0 object-cover object-center"
  />
  <span class="flex-grow flex flex-col pl-4">
    <span class="title-font font-medium">{name}</span>
    <span class="text-secondary text-xs tracking-widest mt-0.5"
      >{authorTitle}</span
    >
  </span>
</a>

<p class="text-secondary text-xs tracking-widest font-semibold">
  {new Date(date).toDateString()}
</p>

<div class="mb-5 flex justify-between">
  <div>
    {#if tags}
      <div class="mt-5 space-x-2">
        {#each tags as tag}
          <span class="badge badge-primary">{tag}</span>
        {/each}
      </div>
    {/if}
  </div>
</div>

<article class="prose mb-28">
  {@html html}
</article>
```

Made it through all that? Good! Ok, so now I have a list of posts that
I can click through to from the index page.

I'll explore a bit now with KitQL and detail what I get out of the box
with the configuration I currently have.

## Caching in KitQL

Alright I have something of a project now where I can click a link on
the index page to go to the post page.

If I pop open the browser console, do a page reload and take a look at
the output I get this:

```text
[KitQL Client] From: SSR,     Operation: KQL_AllPages
[KitQL Client] From: SSR,     Operation: KQL_AllPosts
```

KitQL is getting the data Server Side Rendered (SSR). For me before
the page loads.

Now if hover the mouse over one of the READ &rarr; links I get this:

```text
[KitQL Client] From: NETWORK, Operation: KQL_GetPost, Variables: {"slug":"technical-seo-with-graphcms"}
```

KitQL has got the data from the `NETWORK` ready to go.

This is because of the `sveltekit:prefetch` in the `a` tag, this will
go off and run the `load` function in the `[slug].svelte` file. So
it's loaded the data before I've clicked the link.

Clicking the link will take me to the page with the data already
loaded. 🔥

This is a super snappy experience for the user.

Now, because I haven't added a navbar yet (more on that soon), if I go
to the browser 'back' button on the browser the console logs this out
(on mouse hover):

```text
[KitQL Client] From: CACHE,   Operation: KQL_AllPosts
```

KitQL is getting the data from the cache for the route. The index page
loads up super fast!

## There's a widget!!!

One thing I found from a recent meetup talk from JYC is that there's
also a widget that is part of KitQL.

You can use it to display the store contents on the page with the
`KitQLInfo` component that's now part of the `@kitql/all-in` package.

So say I want to check out the contents of the `KQL_AllPosts` store,
in the index page I'll import the component:

```svelte
<script lang="ts" context="module">
  import { KQL_AllPosts } from '$lib/graphql/_kitql/graphqlStores'
  import { KitQLInfo } from '@kitql/all-in'
  export const load = async ({ fetch }) => {
    await KQL_AllPosts.query({ fetch })
    return {}
  }
</script>
```

Then I can use the component passing in the `KQL_AllPosts` store:

```svelte
<KitQLInfo store={KQL_AllPosts} />
```

Going over to the index page of the project now I can see the
`KitQLInfo` component in it's initial state:

[![kitql-kitqlinfo-component-initial]]
[kitql-kitqlinfo-component-initial]

If I click on the store name in the component it expands out with the
store data with options to reset the current store and options for
where to to query the data from:

[![kitql-kitqlinfo-component-expanded]]
[kitql-kitqlinfo-component-expanded]

Super neat!

## Conclusion

KitQL is an awesome bit of, ahem, kit!

I've already linked the resources but will put them here for ease of
access:

- Follow [JYC] on Twitter for daily updates
- [KitQL Docs](https://kitql.vercel.app/docs)
- [Explaner video by JYC](https://www.youtube.com/watch?v=6pH4fnFN70w)
- [KitQL All In](https://github.com/jycouet/kitql/tree/main/packages/all-in)

You can check out the [source code on GitHub] for this post.

Thanks!

<!-- Links -->

[graphql code generator]: https://www.graphql-code-generator.com/
[graphql vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
[explanation video for setting up kitql]:
  https://www.youtube.com/watch?v=6pH4fnFN70w
[jyc]: https://twitter.com/jycouet
[kitql all-in]:
  https://github.com/jycouet/kitql/tree/main/packages/all-in
[source code on github]:
  https://github.com/spences10/kitql-with-sveltekit-and-graphcms

<!-- Images -->

[kitql-kitqlinfo-component-initial]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1648194979/scottspence.com/kitql-kitqlinfo-component-initial.png
[kitql-kitqlinfo-component-expanded]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1648194980/scottspence.com/kitql-kitqlinfo-component-expanded.png
