---
date: 2019-06-11
title: Convert the Gatsby starter blog to use MDX part two
tags: ['learning', 'gatsby', 'guide', 'mdx', 'markdown']
isPrivate: true
---

Since publishing my last post on this [Chris Biscardi] has released an
awesome [MDX egghead.io course] that goes over using MDX in a Gatsby application.
If you want to see how the pros do it then take a look at the play list,
it's an egghead community resource so you can watch it for free.

## What's new in this guide

I've already covered the conversion [here] if you want to check that
out, I'll be going over that again here but also adding:

- Code blocks 🎉
- Using components for page elements

I've gone and made a video of the conversion as well, here:

`video: https://www.youtube.com/watch?v=gck4RjaX5D4`

## Versions:

**This guide is being used with the following dependency versions.**

- @mdx-js/mdx: 1.0.27
- @mdx-js/react: 1.0.27
- gatsby-plugin-mdx: 1.0.13
- gatsby: 2.13.8
- react: 16.9.0
- react-dom: 16.9.0

You can also check out the [example code].

---

We're going to need some links, which are:

- [CodeSandbox docs for importing projects]
- [CodeSandbox import wizard]
- [Gatsby starter blog]

## Import to CodeSandbox

If you want to follow along then go grab the URL for the [Gatsby
starter blog] paste it into the [CodeSandbox import wizard] this will
open the representation of the code on GitHub.

Click on the fork button so we can start making changes.

Now we're going to go about moving from using Gatsby transformer
remark over to MDX.

For the initial conversion the majority of the changes will be
replacing `MarkdownRemark` with `Mdx` and `allMarkdownRemark` with
`allMdx`.

First we're going to need to import some dependencies to get MDX
running in our Gatsby project.

With the add dependency button in CodeSandbox add the following
dependencies:

- `gatsby-plugin-mdx`
- `@mdx-js/mdx`
- `@mdx-js/react`

```bash
yarn add gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
```

Ok, the files to change are:

- `gatsby-node.js`
- `gatsby-config.js`
- `index.js`
- `blog-post.js`

Let's start editing them! 🚲

## `gatsby-node.js`

Change `allMarkdownRemark` occurrences with `allMdx`, and change the
`node.internal.type` from `MarkdownRemark` to `Mdx`.

## `gatsby-config.js`

Here we're going to replace `gatsby-transformer-remark` with
`gatsby-plugin-mdx` and add in the extensions array for both `.mdx`
and `.md` file types.

```js
extensions: [`.mdx`, `.md`],
```

Then rename the `plugins` array to `gatsbyRemarkPlugins` we also need
to add a `plugins` array to cater for `gatsby-remark-images` as well.

```js
plugins: [
  {
    resolve: `gatsby-remark-images`,
    options: {
      maxWidth: 590,
    },
  },
],
```

## `index.js`

Here we're going to alter the `posts` variable to take the `Mdx`
edges.

The `Mdx` edges are taken from the page query, which is also altered
to use `allMdx` in place of `allMarkdownRemark`.

Replace the `dangerouslySetInnerHTML` prop with a normal `<p>` tag:

```jsx
<p
	dangerouslySetInnerHTML={{
		__html: node.frontmatter.description || node.excerpt,
	}}
/>
```

Replace with:

```jsx
<p>{node.frontmatter.description || node.excerpt}</p>
```

## `blog-post.js`

Now last on the list to get MDX working is the blog post template,
we're going to need to import `MDXRenderer` from `gatsby-plugin-mdx`
we're going to replace `dangerouslySetInnerHTML` with this shortly.

Here's where we use it, we'll come onto `post.code.body`.

Again in the query we're replacing `markdownRemark` with `mdx` and
this time also doing away with `html` from the query and adding in
`body` which we're using in our render method.

```jsx
<div dangerouslySetInnerHTML={{ __html: post.html }} />
```

```jsx
<MDXRenderer>{post.body}</MDXRenderer>
```

## Now we're using MDX!

So now we can create a `.mdx` post, and import a react component into
it.

First let's make an `index.mdx` file in `content/blog/` and add some
frontmatter and some content:

```mdx
---
title: Hello MDX!
date: 2019-07-14
---

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---
```

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

## MDXProvider

If you want to change the rendering of any of the page elements, i.e.
`H1`, `H2`, `p`, `a`, `li` etc. Then we can use the `MDXProvider`,
`MDXProvider` is a component that we can place anywhere in the
component tree _but_ it make sense to have it as high up the component
tree as possible.

The `MDXProvider` is what we're going to use to override our page
elements by using the Gatsby browser and Gatsby SSR API
`wrapRootElement`, this will allow us to wrap the entire application
with an `MDXProvider`.

## Wrap up!

Ok, we've gone and converted the Gatsby starter blog from using
Markdown Remark over to using MDX and added some custom components for
the page elements

**Thanks for reading** 🙏

I hope you found this guide helpful.

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

<!-- Links -->

[mdx egghead.io course]:
	https://egghead.io/playlists/building-websites-with-mdx-and-gatsby-161e9529
[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama
[example code]:
	https://codesandbox.io/s/gatsby-starter-blog-mdx-part-two-8iut4
[gatsby starter blog]: https://github.com/gatsbyjs/gatsby-starter-blog
[codesandbox import wizard]: https://codesandbox.io/s/github
[codesandbox docs for importing projects]:
	https://codesandbox.io/docs/importing
[chris biscardi]: https://twitter.com/chrisbiscardi
[here]:
	https://scottspence.com/posts/convert-gatsby-default-blog-to-mdx
