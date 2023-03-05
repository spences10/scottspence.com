---
date: 2021-05-06
title: SvelteKit starter blog with GraphCMS
tags: ['svelte', 'sveltekit', 'vite', 'graphcms']
isPrivate: false
---

I made a starter blog with SvelteKit and GraphCMS, I've been doing a
couple of small projects with it and I _really_ like it!

This will focus mainly on the Svelte and SvelteKit side with not too
much emphasis on the GraphCMS side. GraphCMS has a blog starter that
you can spin up real quick to get started using the platform.

## Create the backend with GraphCMS

First up I'll create a GraphCMS project for this starter to pull the
posts from, if you're following along you can crate a GraphCMS account
either with email or by logging in with your GitHub account.

Once you're signed in you can either create a new project from scratch
or pick one of the starters that are available.

I'm going to pick the "Blog Starter" project which will have GraphCMS
schema already created with some content to use.

Next I'm prompted to give my project a name and a description then
I'll need to pick the (data center) region where I want the project to
live, I'm picking Europe as that closest to me then clicking the
"Create Project" button.

I'm then prompted to pick the pricing plan for the project, as this is
only a demo I'll pick the community pricing plan (free) and skip
inviting team members.

## Scaffold out the SvelteKit project

Now I'll create a directory for the project change directory into it
(`cd`) and use the SvelteKit `npm init` script:

```bash
mkdir sveltekit-starter-blog
cd sveltekit-starter-blog
# initialise SvelteKit
npm init svelte@next
```

I chose the skeleton project option with no TypeScript support and
ESLint and Prettier config. Now I can install the dependencies with:

```bash
npm i
```

I can now start the dev server and take a look at the project, I'll
start the dev server with `npm run` and add some additional parameters
to the script with `--` then `-o` (or `--open`) to open in the browser
and `-p 3300` (or `--port 3300`) to specify the port to run on:

```bash
npm run dev -- -o -p 3300
```

That's the project, pretty bare bones with nothing other than a
landing page!

## Add TailwindCSS

There's a really useful GitHub project that adds additional
functionality to your Svelte projects with [Svelte Add] in this case
I'm going to add Tailwind with the Just In Time (JIT) compiler
enabled:

```bash
npx svelte-add tailwindcss  --jit
```

Then I'll need to create the base CSS file and add in the Tailwind
directives for `base`, `components`, and `utilities`:

```bash
touch src/app.css
```

Add in the Tailwind directives to the `src/app.css` file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

I'll come onto the styling later for now I'm going to focus on getting
the posts into the project and using the SvelteKit layout to add some
elements that are persisted through route changes.

Create a SvelteKit layout in the routes folder:

```bash
touch src/routes/__layout.svelte
```

The layout will be wrapping the project so the one requirement of a
`__layout.svelte` in SvelteKit is a `<slot/>` see my notes on Svelte
[slots] for more on that.

In the layout I'll import the global CSS and add in a basic nav for
now along with the required slot:

```html
<script>
  import '../app.css'
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<slot />
```

## Get the posts from GraphCMS

First up I'll list out the posts from the GraphCMS GraphQL endpoint
into the index page (home page) of the project so that there's a list
of clickable links to take the user to the post.

I'll be using `graphql-request` to query the posts so I'll install
that along with `graphql`:

```bash
npm i -D graphql-request graphql
```

Here's what I want `graphql-request` to do for me, this example is
taken from the [prisma labs example] documentation with the required
query from my project:

```js {5}
import { gql, GraphQLClient } from 'graphql-request'

export async function load() {
  const graphcms = new GraphQLClient(
    import.meta.env.VITE_GRAPHCMS_URL,
    {
      headers: {},
    }
  )

  const query = gql`
    query Posts {
      posts {
        id
        title
        slug
        date
        excerpt
      }
    }
  `

  const { posts } = await graphcms.request(query)

  return {
    props: {
      posts,
    },
  }
}
```

Note line 5 where it's requiring the endpoint, I'll need to create an
`.env` file for that and define the `VITE_GRAPHCMS_URL` note that the
`env` variable is prefixed with `VITE_` to expose it to the client,
you can check out the [SvelteKit faq] for more info:

```bash
touch .env
```

I'll need to get the GraphQL endpoint from GraphCMS for
`graphql-request`. So from my GraphCMS dashboard for my project
there's a navigation bar on the left hand toward the bottom there's a
settings button. Clicking that for the settings panel then under
"Access" there's an "API Access" page that will show the URL endpoint.

One thing I'll need to do before copying the URL endpoint is set the
API access permissions, I'll only want posts from the published stage
so I'm going to check the "Content from stage Published" checkbox.

CLicking on the URL endpoint on the settings screen will copy it to my
clipboard I can then add that to the `.env` file:

```text
VITE_GRAPHCMS_URL=https://api-eu-central-1.graphcms.com/v2/projectid/master
```

I'm using Svelte `script context="module"` so that that I can get the
posts from the GraphCMS endpoint ahead of time. That means it's run
when the page is loaded and the posts can be loaded ahead of the page
(component) being rendered on the screen:

```html
<script context="module">
  import { gql, GraphQLClient } from 'graphql-request'

  export async function load() {
    const graphcms = new GraphQLClient(
      import.meta.env.VITE_GRAPHCMS_URL,
      {
        headers: {},
      }
    )

    const query = gql`
      query Posts {
        posts {
          id
          title
          slug
          date
          excerpt
        }
      }
    `

    const { posts } = await graphcms.request(query)

    return {
      props: {
        posts,
      },
    }
  }
</script>

<script>
  export let posts
</script>

<svelte:head>
  <title>SvelteKit starter blog</title>
</svelte:head>

<h1 class="text-3xl">SvelteKit starter blog</h1>
<ul>
  {#each posts as post}
  <li>
    <a class="text-blue-600 underline" href="/post/{post.slug}">
      {post.title}
    </a>
  </li>
  {/each}
</ul>
```

Breaking this down a bit, the `props: {posts}` (or `props.posts`) that
are being returned by the `graphql-request` in the Svelte module are
then accepted as props to the page with:

```html
<script>
  export let posts
</script>
```

I'm then using Svelte `{#each}` to loop through (over, round,
whatever) the posts returned from the GraphQL query made in the
`graphql-request` with some minimal Tailwind classes.

Now I have the projects listed I can click on the links but they don't
go anywhere and the error message isn't great either, I'll fix that by
making an error page.

## Adding an error page

I'll create a basic error page to show some information to the user,
first up create the page in the `routes` folder:

```bash
touch src/routes/__error.svelte
```

Then add in the error message and status:

```html
<script context="module">
  export function load({ error, status }) {
    return {
      props: { error, status },
    }
  }
</script>

<script>
  export let error, status
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<h1>{status}: {error.message}</h1>
```

Now clicking one of the home page links will give a nicer looking
error.

## Routes for the blog posts

If you are familiar with [NextJS dynamic routes] then this next part
will be familiar, if not then it's a way to determine the routes (URL
address) in the project programmatically.

```bash
mkdir src/routes/post/
# note the quotes around the path here 👇
touch 'src/routes/post/[slug].svelte'
```

Now in the `[slug].svelte` file I can do pretty much the same to query
the GraphQL endpoint on GraphCMS for a single post, I'll specify the
post `slug` to bring display the post relating to it.

The query looks like this:

```graphql
query PostPageQuery($slug: String!) {
  post(where: { slug: $slug }) {
    title
    date
    content {
      html
    }
    tags
    author {
      id
      name
    }
  }
}
```

This looks a little different to the query on the index page as I'm
specifying a single post with the `$slug` variable.

To get the `$slug` variable I'll pull that from the `context`
parameter that is passed to the `load` function:

```html {4}
<script context="module">
  import { gql, GraphQLClient } from 'graphql-request'

  export async function load(context) {
    const graphcms = new GraphQLClient(
```

That can be used to get the `.page.params.slug` which is what I can
add to the variables object for the `graphql-request`.

```html
<script context="module">
  import { gql, GraphQLClient } from 'graphql-request'

  export async function load(context) {
    const graphcms = new GraphQLClient(
      import.meta.env.VITE_GRAPHCMS_URL,
      {
        headers: {},
      }
    )

    const query = gql`
      query PostPageQuery($slug: String!) {
        post(where: { slug: $slug }) {
          title
          date
          content {
            html
          }
          tags
          author {
            id
            name
          }
        }
      }
    `

    const variables = {
      slug: context.page.params.slug,
    }

    const { post } = await graphcms.request(query, variables)

    return {
      props: {
        post,
      },
    }
  }
</script>

<script>
  export let post
</script>

<svelte:head>
  <title>{post.title}</title>
</svelte:head>

<h1>{post.title}</h1>
<p>{post.author.name}</p>
<p>{post.date}</p>
<p>{post.tags}</p>
{@html post.content.html}
```

Take note of the last line here where I'm using the Svelte `@html`
tag, this renders content with HTML in it.

It will take this:

```html
<p>This is a blog post paragraph.</p>
<p></p>
<p>This is another a blog post paragraph.</p>
```

And render it to:

```markdown
This is a blog post paragraph.

This is another a blog post paragraph.
```

Svelte doesn't sanitise anything inside the `{@html ...}` so make sure
that you trust the source of that data or you risk exposing the users
to XSS attacks.

## Style it

Now I've covered displaying a list of content and using dynamic routes
with SvelteKit it's time to make it not look like crap! 😂

I'll be using [Tailblocks] for the styling elements, rather than dump
out all the HTML here what I have done is made an example repo for
reference or use as a starter.

## Conclusion

I'm still early days with Svelte but so far I'm super impressed with
it. This was an example with GraphCMS for the backend you can use
Ghost, Sanity or whatever else fits your fancy.

[svelte add]: https://github.com/svelte-add/svelte-add
[slots]: https://scottspence.com/posts/notes-on-svelte/#slots
[nextjs dynamic routes]:
  https://nextjs.org/docs/routing/dynamic-routes
[prisma labs example]:
  https://github.com/prisma-labs/graphql-request#authentication-via-http-header
[sveltekit faq]: https://kit.svelte.dev/faq#env-vars
[tailblocks]: https://tailblocks.cc/
