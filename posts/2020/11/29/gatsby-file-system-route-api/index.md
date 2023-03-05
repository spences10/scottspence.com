---
date: 2020-11-29
title: Gatsby File System Route API with MDX
tags: ['gatsby', 'mdx', 'learning']
isPrivate: false
---

The Gatsby File System Route API was [announced recently] and I have
been having a play around with it. If you're not familiar with it,
it's something like the [dynamic routing you get with Next.js]. If
you're not familiar with that either then it's a way to generate your
page routes from data.

This approach means that there's no need to use the Gatsby
`gatsby-node.js` file and related APIs to create your project pages
from data.

In this walkthrough I'm going to set up the Gatsby File System Route
API on a project using MDX and Chakra UI.

Why Chakra UI? I made a [Getting Started Chakra UI Gatsby] post
recently and it's something I want to invest a bit more time into to
aid me in developing faster.

## Bootstrap with a starter

With the getting started post I created a Gatsby starter I'll base
this project off of that with the Gatsby CLI:

```bash
gatsby new \
  gatsby-file-system-route-api-mdx \
  https://github.com/spences10/gatsby-starter-chakra-ui
```

ℹ The `\` is only there so you can view them all in one column rather
than having you horizontal scroll through them all.

## Content

Cool, cool, cool, now to demonstrate the System Route API I'm going to
need to have some content to generate the paths with.

I'm going to jack the last three months of content from my digital
garden and add it to the root of this project.

I have a particular way _I_ like to structure my posts which is
`YYYY/MM/DD/folder-for-the-post/index.mdx` this is nested in a
`content` folder. (You can structure your files how you like, you do
you.) I use the words folder and directory interchangeably.

So the file structure looks a bit like this:

```text
gatsby-file-system-route-api-mdx/
├─ content/2020/
│  ├─ 09
│  │  └─ 02/how-to-monetise-your-content/
│  │    └─ index.mdx
│  ├─ 10
│  └─ 11
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ images/
│  ├─ pages/
│  └─ woot-wapper.tsx
... more files
```

## Gatsby Source Filesystem

Cool, now there's a bit of content time to point the
`gatsby-source-filesystem` to it, so in this instance, as the source
plugin for it is already installed I'll copy the section pointing to
the images folder and point another configuration to the `content`
folder in the `gatsby-config.js` file:

```json
{
  "resolve": `gatsby-source-filesystem`,
  "options": {
    "name": `images`,
    "path": `${__dirname}/content`
  }
},
```

## Gatsby MDX Plugin

Now I'm going to need something to parse the MDX files I'm using, time
to install the Gatsby MDX plugin, I'll also need the related `@mdx`
dependencies:

```bash
yarn add gatsby-plugin-mdx \
  @mdx-js/mdx \
  @mdx-js/react
```

And to configure that in the Gatsby plugin array in the
`gatsby-config.js` file:

```json
{
  "resolve": `gatsby-plugin-mdx`,
  "options": {
    "extensions": [`.mdx`, `.md`]
  }
},
```

Fun fact you don't actually need to have the `extensions` option
configured which I discovered on a stream with James Q Quick! I like
to have it in there to be explicit.

## Time to spin up the dev server!

Now that I have some content for the routes API to make paths for I
can spin up the Gatsby development server on my machine:

```bash
yarn dev
```

ℹ Tip, if you have other dev servers running on the default Gatsby
port (8000) you can change it by passing flags to the Gatsby CLI, in
the next example I can use the `-p` flag to specify the port to open
on and the `-o` flag to open the tab on my default browser:

```bash
yarn dev -- -p 8850 -o
```

<!-- cSpell:ignore GraphiQL -->

## Validate data with the Gatsby GraphiQL explorer

Once that's finished I can access the Gatsby Graph<em>i</em>QL
explorer on the localhost by adding the `/___graphql` to the localhost
URL, in the Graph<em>i</em>QL I can access all the data Gatsby has
available in the data layer.

Popping open the explorer I can see that I have `allMdx` and `mdx` now
available to me for use in Gatsby.

So, I can start making a page off of that data, I'll need to grab the
data for one route.

First I'll run a query so I can get a slug, why? So I can use that
slug to uniquely identify that page.

I'll query `allMdx` first up to list out all the MDX content to get a
slug, here's the GraphQL query:

```graphql
{
  allMdx {
    nodes {
      id
      slug
      frontmatter {
        date
        title
      }
    }
  }
}
```

From that I'll take a slug to use in a `mdx` query I'll grab the slug
`09/02/how-to-monetise-your-content/`

```json
{
  "data": {
    "allMdx": {
      "nodes": [
        {
          "id": "4fe1c1af-d3e8-5d20-bee7-dddc6b7452f3",
          "slug": "09/02/how-to-monetise-your-content/",
          "frontmatter": {
            "date": "2020-09-02T00:00:00.000Z",
            "title": "How to Monetise Your Content With Coil and Brave BAT"
          }
        },
        ... lots more data
```

Why am I doing that? I need the individual route data for each page to
be created, to query a single page I'm using the `mdx` query in the
Graph<em>i</em>QL explorer.

The `mdx` query is for a single route which I'm going to identify with
the `slug` I've just pulled from the `allMdx` query.

Now I can pass in the slug via the query variables panel on the
Graph<em>i</em>QL explorer, first up I'll write the query that's going
to take the `slug`, it'll look something like this:

```graphql
query PostBySlug($slug: String!) {
  mdx(slug: { eq: $slug }) {
    id
    slug
    # body
    frontmatter {
      date
      title
    }
  }
}
```

In the query variables panel I can now define the value of the `slug`
variable that the `PostBySlug` query (`PostBySlug($slug: String!)`) is
expecting, that's where `slug` is defined with the `$` to indicate
it's a variable and the `:String!` is the type of the variable, in
this case a string, the `!` indicates that it's a required parameter
or the query wont run:

```json
{
  "slug": "09/02/how-to-monetise-your-content/"
}
```

You may notice that the `body` field has a `#` next to it, that's
commenting it out, as I'm only looking to see a result and the body
content can be a bit noisy in the Graph<em>i</em>QL explorer, I'm
leaving it in there as I'll be using it in a page query very soon.

## Pages file notation

Now that I know that the data for the MDX content I've added is
available via the Graph<em>i</em>QL explorer I need to create

To use the File System Route API, I'll use some [curly bois] `{}` in
my filename to signify dynamic URL parts that relate to a field within
a node.

Clear as mud?

Remember the query I made to select a single MDX page??

```graphql
query PostBySlug($slug: String!) {
  mdx(slug: { eq: $slug }) {
    slug
  }
}
```

I want to reference the single MDX node with the `mdx` query and using
the `slug` to identify which node.

In the magic `pages` directory in my gatsby project I'll create a file
detailing that I want to use the `mdx` query and the `slug` to signify
the URL and wrap the file name in some curly bois:

```
{mdx.slug}.js
```

In the file structure like this:

<!-- cSpell:ignore shiz -->

```text
gatsby-file-system-route-api-mdx/
... content
├─ src/
... other folders n' shiz
│  ├─ pages/
│  │  └─ {mdx.slug}.js
... more files
```

I already have my Gatsby dev server running and for the file paths to
be created I'll need to stop start the dev server (Ctrl+c) then start
it again `yarn dev`.

## Validate path creation

Super duper! Now it's time to check that the Gatsby File System Route
API is doing it's magic.

If you didn't know already you can check the all the pages generatred
by Gatsby from the Gatsby 404 page, to access it I can enter a route
that doesn't exist to see it or add the `404.js` path to the localhost
URL, like `http://localhost:8000/404.js` from here I can see that the
routes have been created.

Clicking one of those routes wont do anything yet as there's nothing
in the `{mdx.slug}.js` file to tell Gatsby what to do!

## Creating the pages

Now, to tell Gatsby what to do when one of those routes are hit,
currently there's only been a file path created.

In the `{mdx.slug}.js` file, I'll first scaffold out a basic React
component:

```jsx
import React from 'react'

export default function PostPage() {
  return (
    <>
      <h1>Yo!</h1>
    </>
  )
}
```

Clicking on any of the routes from the `404.js` page will now create a
page with a h1 of `Yo!` on there.

Now time to add a bit more data to the page, I'll do that by using a
GraphQL query in there:

```js {4-7,15-27}
import { graphql } from 'gatsby'
import React from 'react'

export default function PostPage({ data }) {
  console.log('=====================')
  console.log(data)
  console.log('=====================')
  return (
    <>
      <h1>Yo!</h1>
    </>
  )
}

export const query = graphql`
  query PostBySlug($slug: String) {
    mdx(slug: { eq: $slug }) {
      id
      slug
      body
      frontmatter {
        date
        title
      }
    }
  }
`
```

Now that I have defined the query I want to use for the data in the
page this will be made available via a data prop that is being
destructured from the props.

Destructuring is a way to pull the data without having to chain it
from the `props`, it's a shorter way of doing this:

```js
export default function PostPage(props) {
  console.log('=====================')
  console.log(props.data)
  console.log('=====================')
  return (
  ... rest of the component
```

Console log to check the data in the browser console gives me the
results from the `mdx` query.

Cool, cool, cool, now I can use the `MDXRenderer` to render out the
MDX as if it were Markdown, I'll import that along with a Chakra UI
`Text` component:

```js {1,3,7-10,13-14}
import { Text } from '@chakra-ui/react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import React from 'react'

export default function PostPage({ data }) {
  const {
    body,
    frontmatter: { title },
  } = data.mdx
  return (
    <>
      <Text fontSize="4xl">{title}</Text>
      <MDXRenderer>{body}</MDXRenderer>
    </>
  )
}

export const query = graphql`
  query PostBySlug($slug: String) {
    mdx(slug: { eq: $slug }) {
      id
      slug
      body
      frontmatter {
        date
        title
      }
    }
  }
`
```

## Bonus content

So the page looks nice n' all that but what about the images that are
with the Markdown and opening links in there?

Ok, there's a usual list of Gatsby remark plugins I use, these are:

- `gatsby-remark-autolink-headers` > gives each heading an ID
- `gatsby-remark-copy-linked-files` > opens each image in a new tab
- `gatsby-remark-smartypants` > makes your punctuation look nice
- `gatsby-remark-images` > displays images in the Markdown
- `gatsby-remark-external-links` > links go out in a new tab when
  clicked

I'll add them all and configure the `gatsby-config.js` file, I'll
install them via the terminal first of all:

```bash
yarn add gatsby-remark-autolink-headers \
  gatsby-remark-copy-linked-files \
  gatsby-remark-smartypants \
  gatsby-remark-images \
  gatsby-remark-external-links
```

ℹ The `\` is only there so you can view them all in one column rather
than having you horizontal scroll through them all.

Now these can all go into the `gatsbyRemarkPlugins` array for the MDX
plugin.

```js
gatsbyRemarkPlugins: [
  `gatsby-remark-autolink-headers`,
  `gatsby-remark-copy-linked-files`,
  `gatsby-remark-smartypants`,
  {
    resolve: `gatsby-remark-images`,
    options: {
      maxWidth: 1200,
    },
  },
  {
    resolve: `gatsby-remark-external-links`,
    options: {
      target: `_blank`,
      rel: `noopener`,
    },
  },
],
```

And I'll add all of that to the `gatsby-plugin-mdx` config object:

```js {5-22}
{
  resolve: `gatsby-plugin-mdx`,
  options: {
    extensions: [`.mdx`, `.md`],
    gatsbyRemarkPlugins: [
      `gatsby-remark-autolink-headers`,
      `gatsby-remark-copy-linked-files`,
      `gatsby-remark-smartypants`,
      {
        resolve: `gatsby-remark-images`,
        options: {
          maxWidth: 1200,
        },
      },
      {
        resolve: `gatsby-remark-external-links`,
        options: {
          target: `_blank`,
          rel: `noopener`,
        },
      },
    ],
  },
}
```

Now my MDX is a whole lot prettier! 🎉

## Recap and wrap!

Ok, that's it for the file routes! To recap what I did:

- Created a project from a starter with the Gatsby CLI
- Added some content
- Configured the Gatsby Source Filesystem
- Added and configured the Gatsby MDX Plugin
- Validated the content was available via the Graph<em>i</em>QL
  explorer
- Created the dynamic page with the curly boi notation `{mdx.slug}.js`
- Validated the pages were created Gatsby `404.js` page
- Used the MDXRenderer to render out the MDX on the page

The source code for this walkthough can be found on GitHub in the
Gatsby [File System Route Starter] I made.

<!-- Links -->

[announced recently]: https://www.gatsbyjs.com/blog/fs-route-api/
[dynamic routing you get with next.js]:
  https://nextjs.org/blog/next-9#dynamic-route-segments
[getting started chakra ui gatsby]:
  https://scottspence.com/posts/getting-started-chakra-ui-gatsby/
[file system route starter]:
  https://github.com/spences10/gatsby-starter-file-system-route-api-mdx
[curly bois]: https://twitter.com/spences10/status/1329335632041299971
