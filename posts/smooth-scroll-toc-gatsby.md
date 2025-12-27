---
date: 2020-02-13
title: Add a Table of Contents with Smooth scroll using Gatsby and MDX
tags: ['learning', 'gatsby', 'guide', 'mdx', 'markdown']
is_private: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

> If you're having issues with the clicks not scrolling to link IDs
> see [Not scrolling to ID](#not-scrolling-to-id)

The main purpose for me documenting this is to demonstrate
implementing a table of contents with smooth scroll to the anchors in
a Gatsby project using MDX.

In the process I'm also setting up the Gatsby starter with MDX.

**TL;DR, go here:** [Make a TOC component](#make-a-toc-component)

I like using styled-components for my styling and would like to use
them in this example, so I'm going to clone the Gatsby starter I made
in a [previous post].

## Clone the Gatsby Default Starter with styled-components

Spin up a new project using the template I made:

```bash
npx gatsby new \
  gatsby-toc-example \
  https://github.com/spences10/gatsby-starter-styled-components
```

Once that has finished installing I'm going to `cd` into the project
(`cd gatsby-toc-example`) and install dependencies for using MDX in
Gatsby.

```bash
# you can use npm if you like
yarn add gatsby-plugin-mdx \
  @mdx-js/mdx \
  @mdx-js/react
```

## Add some content

Create a `posts` directory with a `toc-example` directory in it which
contains the `index.mdx` file I'll be adding the content to.

```bash
mkdir -p posts/toc-example
touch posts/toc-example/index.mdx
```

I'll paste in some content, I'll take from the [markdown from this
post!]

## Configure the project to use MDX

To enable MDX in the project I'll add the `gatsby-plugin-mdx`
configuration to the `gatsby-config.js` file.

```js
{
  resolve: `gatsby-plugin-mdx`,
  options: {
    extensions: [`.mdx`, `.md`],
    gatsbyRemarkPlugins: [],
  },
},
```

I'll also need to add the posts directory to the
`gatsby-source-filesystem` config as well.

```js
{
  resolve: `gatsby-source-filesystem`,
  options: {
    name: `posts`,
    path: `${__dirname}/posts`,
  },
},
```

Stop the dev server (`Ctrl+c` in the terminal) and start with the new
configuration.

Once the dev server has started back up, I'll validate the Gatsby MDX
config by seeing if `allMdx` is available in the Graph<em>i</em>QL
explorer (`localhost:8000/___graphql`).

```graphql
{
  allMdx {
    nodes {
      excerpt
    }
  }
}
```

## Configure Gatsby node to create the fields and pages

Here I'll make all the paths for the files in the `posts` directory,
currently it's only `gatsby-toc-example`. I'll do that with
`createFilePath` when creating the node fields with `createNodeField`.

```js
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

Stop and start the gatsby dev server again as I changed
`gatsby-node.js`.

In the Gatsby GraphQL explorer (Graph<em>i</em>QL) validate that the
fields are being created.

```graphql
{
  allMdx {
    nodes {
      fields {
        slug
      }
    }
  }
}
```

## Create a post template

To make the pages for the content in the `posts` directory, I'll need
a template to use with the Gatsby `createPages` API.

To do that, I'll create a `templates` directory in `src` then make a
`post-template.js` file.

```bash
mkdir src/templates
touch src/templates/post-template.js
```

For now, I'm going to return a `h1` with **Hello template** so I can
validate the page was created by Gatsby node.

```jsx
import React from 'react'

export default () => {
  return (
    <>
      <h1>Hello template</h1>
    </>
  )
}
```

Save the template, now to create the pages in `gatsby-node.js` I'm
adding the following.

```jsx {2,4-35}
const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require(`path`)

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions
  const postTemplate = path.resolve('src/templates/post-template.js')

  return graphql(`
    {
      allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      throw result.errors
    }

    const posts = result.data.allMdx.nodes

    posts.forEach((post, index) => {
      createPage({
        path: post.fields.slug,
        component: postTemplate,
        context: {
          slug: post.fields.slug,
        },
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

I know there's a lot in there to unpack, so, if you need more detail
check out the sections in the "[Build a coding blog from scratch with
Gatsby and MDX]", listed here:

- [Index page posts query]
- [Slugs and Paths]
- [Link Paths]
- [Adding a Blog Post Template]
- [Build out Blog Post Template]

## Confirm the pages were created with Gatsby's built in 404 page

Stop and start the dev server as there's been changes to Gatsby node.

Check the page has been created, to do that add `/404.js` to the dev
server url which will show all the available pages in the project.

From here I can select the path created to `/toc-example/` and confirm
the page was created.

## Build out the post template to use the MDXRenderer

Now I can add the data to the `post-template.js` page from a GraphQL
query. I'll do that with the Gatsby `graphql` tag and query some
frontmatter, body and the table of contents.

This query is taking the `String!` parameter of `slug` passed to it
from `createPage` in `gatsby-node.js`.

```graphql
query PostBySlug($slug: String!) {
  mdx(fields: { slug: { eq: $slug } }) {
    frontmatter {
      title
      date(formatString: "YYYY MMMM Do")
    }
    body
    excerpt
    tableOfContents
    timeToRead
    fields {
      slug
    }
  }
}
```

Destructure the `body` and `frontmatter` data from `data.mdx`, `data`
is the results of the `PostBySlug` query. Wrap the `body` data in the
`<MDXRenderer>` component.

The `frontmatter.title` and `frontmatter.date` can be used in `h1` and
`p` tags for now.

```jsx {1-2,5-6,9-10,16-32}
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import React from 'react'

export default ({ data }) => {
  const { body, frontmatter } = data.mdx
  return (
    <>
      <h1>{frontmatter.title}</h1>
      <p>{frontmatter.date}</p>
      <MDXRenderer>{body}</MDXRenderer>
    </>
  )
}

export const query = graphql`
  query PostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "YYYY MMMM Do")
      }
      body
      excerpt
      tableOfContents
      timeToRead
      fields {
        slug
      }
    }
  }
`
```

I'm going to be using `tableOfContents` later when I make a table of
contents component.

## Add page elements for the MDXProvider

The content (headings, paragraphs, etc.) were reset with
`styled-reset` in the template being used so will need to be added in.

I'm going to be amending the already existing `H1` and `<P>`
styled-components to be React components so that I can spread in the
props I need for the heading ID.

```jsx {1,4,11-13}
import React from 'react'
import styled from 'styled-components'

export const StyledH1 = styled.h1`
  font-size: ${({ theme }) => theme.fontSize['4xl']};
  font-family: ${({ theme }) => theme.font.serif};
  margin-top: ${({ theme }) => theme.spacing[8]};
  line-height: ${({ theme }) => theme.lineHeight.none};
`

export const H1 = props => {
  return <StyledH1 {...props}>{props.children}</StyledH1>
}
```

Create a `<H2>` component based off of the `<H1>`, adjust the spacing
and font size.

```jsx
import React from 'react'
import styled from 'styled-components'

export const StyledH2 = styled.h2`
  font-size: ${({ theme }) => theme.fontSize['3xl']};
  font-family: ${({ theme }) => theme.font.serif};
  margin-top: ${({ theme }) => theme.spacing[6]};
  line-height: ${({ theme }) => theme.lineHeight.none};
`

export const H2 = props => {
  return <StyledH2 {...props}>{props.children}</StyledH2>
}
```

I'll need to add the newly created `H2` to the index file for
`page-elements`:

```js {2}
export * from './h1'
export * from './h2'
export * from './p'
```

Same with the `<P>` as I did with the `H1`, I'll switch it to use
React.

```jsx
import React from 'react'
import styled from 'styled-components'

export const StyledP = styled.p`
  margin-top: ${({ theme }) => theme.spacing[3]};
  strong {
    font-weight: bold;
  }
  em {
    font-style: italic;
  }
`

export const P = props => {
  const { children, ...rest } = props
  return <StyledP {...rest}>{children}</StyledP>
}
```

Importing the modified components into the `root-wrapper.js` I can now
pass them into the `<MDXProvider>` which is used to map to the HTML
elements created in markdown.

There's a complete listing of all the HTML elements that can be
customised on the [MDX table of components].

In this example I'm mapping the `H1`, `H2` and `P` components to the
corresponding HTML elements and passing them into the `<MDXProvider>`.

```jsx {1,5,8-12,17,19}
import { MDXProvider } from '@mdx-js/react'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import Layout from './src/components/layout'
import { H1, H2, P } from './src/components/page-elements'
import { GlobalStyle, theme } from './src/theme/global-style'

const components = {
  h1: props => <H1 {...props} />,
  h2: props => <H2 {...props} />,
  p: props => <P {...props} />,
}

export const wrapPageElement = ({ element }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <MDXProvider components={components}>
      <Layout>{element}</Layout>
    </MDXProvider>
  </ThemeProvider>
)
```

## Add gatsby-remark-autolink-headers for adding id's to headers

Now I have a page, with some content and headers I should now be able
to navigate to the individual headings, right?

Well, not quite, although the headers are there, there's no IDs in
them to scroll to yet.

I can use [gatsby-remark-autolink-headers] to create the heading IDs.

```bash
yarn add gatsby-remark-autolink-headers
```

Add `gatsby-remark-autolink-headers` in the Gatsby MDX config.

```js {5}
{
  resolve: `gatsby-plugin-mdx`,
  options: {
    extensions: [`.mdx`, `.md`],
    gatsbyRemarkPlugins: [`gatsby-remark-autolink-headers`],
  },
},
```

As I've changed the `gatsby-config.js` file I'll need to stop and
start the dev server.

Fix the weird positioning on the SVGs for the links added by
`gatsby-remark-autolink-headers`.

Do that by making some reusable CSS with a tagged template literal,
I'll put it in it's own file `heading-link.js`.

```bash
touch src/components/page-elements/heading-link.js
```

Then add the CSS in as a template literal:

```jsx
export const AutoLink = `
  a {
    float: left;
    padding-right: 4px;
    margin-left: -20px;
  }
  svg {
    visibility: hidden;
  }
  &:hover {
    a {
      svg {
        visibility: visible;
      }
    }
  }
`
```

Then I'm going to use that (`AutoLink`) in the `H2` and anywhere else
that could have a link applied to it (any heading element).

```jsx {10}
import React from 'react'
import styled from 'styled-components'
import { AutoLink } from './linked-headers'

export const StyledH2 = styled.h2`
  font-size: ${({ theme }) => theme.fontSize['3xl']};
  font-family: ${({ theme }) => theme.font.serif};
  margin-top: ${({ theme }) => theme.spacing[6]};
  line-height: ${({ theme }) => theme.lineHeight.none};
  ${AutoLink}
`

export const H2 = props => {
  return <StyledH2 {...props}>{props.children}</StyledH2>
}
```

Clicking around on the links now should scroll to each one smoothly
and have the SVG for the link only visible on hover.

## Make a TOC component

From here onwards is what the whole post boils down to! I did want to
go through the process of how you would do something similar yourself
though, so I'm hoping this has helped in some way.

For the TOC with smooth scroll you need several things:

<!-- cSpell:ignore behavior -->

- `scroll-behavior: smooth;` added to your `html`, this is part of the
  starter I made in a [previous post].
- IDs in the headings to scroll to, this is done with
  `gatsby-remark-autolink-headers`.
- A table of contents which is provided by Gatsby MDX with
  `tableOfContents`.

The first two parts have been covered so now to create a TOC
component, with styled-components.

In the `post-template.js` I'll create a `Toc` component for some
positioning and create a scrollable div to use inside of that.

```jsx
const Toc = styled.ul`
  position: fixed;
  left: calc(50% + 400px);
  top: 110px;
  max-height: 70vh;
  width: 310px;
  display: flex;
  li {
    line-height: ${({ theme }) => theme.lineHeight.tight};
    margin-top: ${({ theme }) => theme.spacing[3]};
  }
`

const InnerScroll = styled.div`
  overflow: hidden;
  overflow-y: scroll;
`
```

The `main` content is overlapping with the TOC here so I'm going to
add a `maxWidth` inline on the `layout.js` component.

```jsx
<main style={{ maxWidth: '640px' }}>{children}</main>
```

## Conditionally render the TOC

Time to map over the `tableOfContents` object:

```jsx
{
  typeof tableOfContents.items === 'undefined' ? null : (
    <Toc>
      <InnerScroll>
        <H2>Table of contents</H2>
        {tableOfContents.items.map(i => (
          <li key={i.url}>
            <a href={i.url} key={i.url}>
              {i.title}
            </a>
          </li>
        ))}
      </InnerScroll>
    </Toc>
  )
}
```

Here's the full `post-template.js` file, I've reused the
`page-elements` components for the `h1`, `h2` on the TOC and `p`:

```jsx {4-5,7-18,20-23,26,29-44}
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import React from 'react'
import styled from 'styled-components'
import { H1, H2, P } from '../components/page-elements'

const Toc = styled.ul`
  position: fixed;
  left: calc(50% + 400px);
  top: 110px;
  max-height: 70vh;
  width: 310px;
  display: flex;
  li {
    line-height: ${({ theme }) => theme.lineHeight.tight};
    margin-top: ${({ theme }) => theme.spacing[3]};
  }
`

const InnerScroll = styled.div`
  overflow: hidden;
  overflow-y: scroll;
`

export default ({ data }) => {
  const { body, frontmatter, tableOfContents } = data.mdx
  return (
    <>
      <H1>{frontmatter.title}</H1>
      <P>{frontmatter.date}</P>
      {typeof tableOfContents.items === 'undefined' ? null : (
        <Toc>
          <InnerScroll>
            <H2>Table of contents</H2>
            {tableOfContents.items.map(i => (
              <li key={i.url}>
                <a href={i.url} key={i.url}>
                  {i.title}
                </a>
              </li>
            ))}
          </InnerScroll>
        </Toc>
      )}
      <MDXRenderer>{body}</MDXRenderer>
    </>
  )
}

export const query = graphql`
  query PostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date(formatString: "YYYY MMMM Do")
      }
      body
      excerpt
      tableOfContents
      timeToRead
      fields {
        slug
      }
    }
  }
`
```

That's it, I can play around navigating between headings now from the
TOC.

## 📺 Here's a video detailing the process.

<!-- cSpell:ignore Kajhlu -->
<YouTube youTubeId="Kp51KajhluE" />

## Demo and Sauce

Source code: https://github.com/spences10/gatsby-smooth-scroll

Demo: https://gatsby-smooth-scroll.vercel.app/toc-example/

## Not scrolling to ID

There's been a recent issue with `gatsby-react-router-scroll` causing
inconsistencies with clicking and scrolling to the IDs, this is [being
addressed by the Gatsby team].

If it's not resolved when you're reading this (dated: 2020-07-08) add
the following to your `package.json`:

```json
"resolutions": {
  "gatsby-react-router-scroll": "3.0.3"
}
```

## Resources that helped me

- [4pine's blog]
- [Theme UI guide]
- [Gatsby MDX repo issue 396]
- [Gatsby MDX repo issue 140]
- [Gatsby MDX repo issue 204]
- [MDX JS repo issue 810]
- [remark-slug repo]

## Thanks for reading 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

---

<!-- Links -->

[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[4pine's blog]:
  https://johno.com/mdx-table-of-contents-components-in-gatsby
[theme ui guide]: https://theme-ui.com/mdx/linked-headings
[gatsby mdx repo issue 396]:
  https://github.com/ChristopherBiscardi/gatsby-mdx/issues/396
[gatsby mdx repo issue 140]:
  https://github.com/ChristopherBiscardi/gatsby-mdx/issues/140
[gatsby mdx repo issue 204]:
  https://github.com/ChristopherBiscardi/gatsby-mdx/issues/204
[remark-slug repo]: https://github.com/remarkjs/remark-slug
[mdx js repo issue 810]: https://github.com/mdx-js/mdx/issues/810
[previous post]:
  https://scottspence.com/posts/globally-style-gatsby-styled-components/
[build a coding blog from scratch with gatsby and mdx]:
  https://scottspence.com/posts/build-an-mdx-blog
[index page posts query]:
  https://scottspence.com/posts/build-an-mdx-blog/#index-page-posts-query
[slugs and paths]:
  https://scottspence.com/posts/build-an-mdx-blog/#slugs-and-paths
[link paths]:
  https://scottspence.com/posts/build-an-mdx-blog/#link-paths
[adding a blog post template]:
  https://scottspence.com/posts/build-an-mdx-blog/#adding-a-blog-post-template
[build out blog post template]:
  https://scottspence.com/posts/build-an-mdx-blog/#build-out-blog-post-template
[markdown from this post!]:
  https://raw.githubusercontent.com/spences10/scottspence.com/authoring/2020/02/13/smooth-scroll-toc-gatsby/index.mdx
[mdx table of components]:
  https://mdxjs.com/getting-started#table-of-components
[gatsby-remark-autolink-headers]:
  https://www.gatsbyjs.com/packages/gatsby-remark-autolink-headers/
[being addressed by the gatsby team]:
  https://github.com/gatsbyjs/gatsby/issues/25554
