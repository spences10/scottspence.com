---
date: 2019-04-09
title: Convert the Gatsby default starter blog to use MDX
tags: ['learning', 'gatsby', 'guide', 'mdx', 'markdown']
is_private: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

In this guide we're going to cover converting the Gatsby default blog
starter to use MDX.

All the cool kids are using Gatsby and MDX in their blogs these days.
If you already have a blog that uses Gatsby but want to move onto the
new hotness then this is the guide for you.

<YouTube youTubeId="gck4RjaX5D4" />

## Versions:

**This guide is being used with the following dependency versions.**

- gatsby: 2.3.5
- react: 16.8.6
- react-dom: 16.8.6
- gatsby-mdx: 0.4.5
- @mdx-js/mdx: 0.20.3
- @mdx-js/tag: 0.20.3

You can also check out the [example code].

---

We're going to need some links, which are:

- [CodeSandbox docs for importing projects]

- CodeSandbox import wizard: `https://codesandbox.io/s/github`

- [Gatsby starter blog]

## Import to CodeSandbox

For this example I'm going to be using the [Gatsby starter blog] and
importing it into CodeSandbox, looking at the docs it says you can do
this with the [CodeSandbox import wizard] linked, paste the link in
there and CodeSandbox will open the representation of the code on
GitHub.

Now we can go about moving from using Gatsby transformer remark over
to MDX.

Let's take a look at what we'll be changing for this example. But
first we're going to need to import some dependencies to get MDX
running in out Gatsby project.

With the add dependency button in CodeSandbox add the following
dependencies:

- `gatsby-mdx`
- `@mdx-js/mdx`
- `@mdx-js/tag`

We will also need to add dependencies for styled-components so may as
well add them now as well:

- `gatsby-plugin-styled-components`
- `styled-components`
- `babel-plugin-styled-components`

Files to change:

- `gatsby-node.js`
- `gatsby-config.js`
- `index.js`
- `blog-post.js`

## `gatsby-node.js`

First up we're going to need to change `gatsby-node.js` this is where
all the pages and data nodes are generated.

Change all markdown remark occurrences with MDX, that's the initial
GraphQL query in create pages, then again in the result.

![initial gatsby node changes]

Then change the `node.internal.type` in `onCreateNode` from
`MarkdownRemark` to `Mdx`.

![last gatsby node changes]

## `gatsby-config.js`

Here we're going to replace `gatsby-transformer-remark` with
`gatsby-mdx`

![replace transformer remark with gatsby-mdx]

## `index.js`

Here we're going to alter the `posts` variable to take the `Mdx`
edges.

![replace all markdown edges]

The `Mdx` edges are taken from the page query, which is also altered
to use `allMdx` in place of `allMarkdownRemark`.

![index page query]

## `blog-post.js`

Now last on the list to get MDX working is the blog post template,
we're going to need to import `MDXRenderer` from `gatsby-mdx` we're
going to replace `dangerouslySetInnerHTML` with this shortly.

![MDX renderer]

Here's where we use it, we'll come onto `post.code.body`.

![replace dangerously set html]

Again in the query we're replacing `markdownRemark` with `mdx` and
this time also doing away with `html` from the query and adding in
`code` for `body` which we're using in our render method.

![blog post query]

## Now we're using MDX!

So now we can create a `.mdx` post, let's do that.

Import the styled-components dependencies:

```bash
gatsby-plugin-styled-components
styled-components
babel-plugin-styled-components
```

Then configure them in `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Gatsby Starter Blog`,
    ...
    },
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
  ...
```

Now we can use styled-components, in `src/components` make a new
component, I have called my one `butt.js` call yours what you like.

We're going to use this component in a `.mdx` document, first the
component:

```js
import styled from 'styled-components'

export const Butt = styled.button`
  background-color: red;
  height: 40px;
  width: 80px;
`
```

Spicy, right! 🌶

Now we can include this component in a `.mdx` document so let's go
ahead and create that, in `content/blog` make a new directory, I'm
giving mine the imaginative name `first-mdx-post`, in there create a
`index.mdx` file and use the frontmatter from one of the other posts
as an example of what to use:

```mdx
---
title: My First MDX Post!
date: '2019-04-07T23:46:37.121Z'
---

# make a site they said, it'll be fun they said

more content yo!
```

This will render a `h1` and a `p` and we should see it render in our
CodeSandbox preview.

Now we can go ahead and import our beautifully crafted button:

```mdx
---
title: My First MDX Post!
date: '2019-04-07T23:46:37.121Z'
---

import { Butt } from '../../../src/components/button'

# make a site they said, it'll be fun they said

more content yo!

<Butt>yoyoyo</Butt>
```

<!-- cSpell:ignore yoyoyo -->

## Wrap up!

So, that's it, we've gone and converted the Gatsby starter blog from
using Markdown Remark over to using MDX.

I hope you have found it helpful.

**Thanks for reading** 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

<!-- Links -->

[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[example code]: https://codesandbox.io/s/lqp6p647q
[gatsby starter blog]: https://github.com/gatsbyjs/gatsby-starter-blog
[codesandbox docs for importing projects]:
  https://codesandbox.io/docs/importing

<!-- Images -->

[initial gatsby node changes]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/initialGatsbyNode.png
[last gatsby node changes]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/lastGatsbyNode.png
[replace transformer remark with gatsby-mdx]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/gatsbyConfig.png
[replace all markdown edges]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/indexPageEdges.png
[index page query]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/indexPageQuery.png
[mdx renderer]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/importMdxRenderer.png
[replace dangerously set html]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/replaceDangerHtml.png
[blog post query]:
  https://now-images-wine.now.sh/2019/convert-gatsby-default-blog-to-mdx/blogPostQuery.png
