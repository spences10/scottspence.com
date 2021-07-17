---
date: 2020-06-04
title: Linaria - Getting Started
tags:
  ['getting started', 'hello world', 'css', 'css-in-js', 'linaria']
isPrivate: false
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

I had a work colleague introduce me to Linaria last week and I've used
it on a project and I quite like it.

Linaria is like styled-components but different as in there's no
runtime cost and some other gotchas I've found along the way.

What does that mean though? I'm going to take the headings from the
[Linaria Docs for benefits] and list them here, for more detail on
them I suggest checking the links in the list.

## Advantages Over other CSS-in-JS solutions

1. [CSS is downloaded and parsed separately from JS]
1. [No extra parsing needed for CSS]
1. [No style duplication on SSR]
1. [Catch errors early due to build-time evaluation]
1. [Familiar CSS syntax]
1. [Works without JavaScript]

## Example Me Up Yo!

[TL;DR to the video] if you like, or read on...

Getting started with Linaria, I'm using the Gatsby default starter (no
surprises there I guess 🤣).

I like styled-components because you're writing CSS not camelCase
style keys.

To start I'll spin up a new project with the Gatsby CLI:

```bash
# with the Gatsby CLI
gatsby new gatsby-starter-linaria
# or with npx
npx gatsby new gatsby-starter-linaria
```

Add Linaria and the Gatsby plugin as dependencies:

```bash
yarn add linaria@next gatsby-plugin-linaria
```

> Error: Cannot find module 'core-js/...'

I'm using `@next` because there's a [known issue] between Linaria and
Gatsby's version of core-js.

I'll add the `.linaria-cache` folder to bottom of the `.gitignore`
file as that's not needed in source control.

```bash
# linaria
.linaria-cache
```

Add `gatsby-plugin-linaria` to the `gatsby-config.js` file in the
`plugins` array:

```js
plugins: [
  `gatsby-plugin-linaria`,
  `gatsby-plugin-react-helmet`,
  {
    resolve: `gatsby-source-filesystem`,
    ...
```

The `...` represents the reset of the items in the array, I've
shortend it for [brevity].

I'll delete the `layout.css` file in the components directory and
remove the `import "./layout.css"` line from the `layout.js`
component.

Now that the reset is removed (when I deleted the `layout.css` file)
there's a bit of a margin showing and everything looks a bit meh!

## Global Style

With CSS-in-JS the styles can be scoped to specific components, more
on this in a bit.

Sometimes there's a need to write some global styles, to get rid of
that margin and to normalise browser inconsistencies.

I'll straight up [jack the example] given in the Linaria docs and add
that to a `theme` folder in the `src` directory. The file structure
will look like this.

```text
gatsby-starter-linaria/
├─ src/
│  ├─ components
│  ├─ images
│  ├─ pages
│  └─ theme
│     └─ globals.js
```

In the `globals.js` file, I'll import the `css` tag from Linaria and
paste in the example.

Add a `body` tag to remove that margin and add a `background` colour
with a bit of contrast so that I can see the styles have been applied.

```js {17}
import { css } from 'linaria'

export const globals = css`
  :global() {
    html {
      box-sizing: border-box;
    }

    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }

    body {
      margin: 0;
      background: red;
    }
  }
`
```

Ok, cool, so that's nice, but wtf do I do with it? Right??

So, from what I can glean the `css` tag will append the global style
to the `body` element of the project no matter where you put it. 🙃

For me it'll make sense to add it to the `layout` component as this is
where all the main styles for this project live and it's what wraps
every other component and page in the project.

For now I'll change the empty fragment (`<></>`) wrapping the layout
component to a div and add a `className` to it to pass the `globals`
to:

```jsx {2,6}
...
import { globals } from "../theme/globals"
...

return (
  <div className={globals}>
    <Header siteTitle={data.site.siteMetadata.title} />
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `0 1.0875rem 1.45rem`,
      }}
    >
      <main>{children}</main>
      ...
```

I can now take some of the styles from the reset I deleted and add
those to the `globals` file:

```js {6-8,20-21}
import { css } from 'linaria'

export const globals = css`
  :global() {
    html {
      box-sizing: border-box;
      font-family: sans-serif;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }

    body {
      margin: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  }
`
```

Now the styles are back to what they were but I'm now using Linaria.

## Using the `styled` tag

Now I can use the Linaria `styled` tag much in the same way I'd use it
with styled-components.

I'm going to convert the components from using the inline `style` tag
to using the Linaria `styled` tag.

I'll work through the components that have styles in them.

**Header:** I'll import the Linaria `styled` tag and make a
`StyledHeader` component:

```js
import { styled } from 'linaria/react'

const StyledHeader = styled.header``
```

From here I can add all the styles in that wrapping component to the
`styled` Linaria tag component.

So I'll add a `div` a `h1` and an `a` tag (the Gatsby `Link` component
is an `a` element) like this:

```js
const StyledHeader = styled.header`
  background: rebeccapurple;
  margin-bottom: 1.45rem;
  div {
    margin: 0 auto;
    max-width: 960px;
    padding: 1.45rem 1.0875rem;
  }
  h1 {
    margin: 0;
  }
  a {
    color: white;
    text-decoration: none;
  }
`
```

Now the component is cleaner with all the inline styling moved to the
`styled` Linaria component.

```jsx
const Header = ({ siteTitle }) => (
  <StyledHeader>
    <div>
      <h1 style={{ margin: 0 }}>
        <Link to="/">{siteTitle}</Link>
      </h1>
    </div>
  </StyledHeader>
)
```

**Layout:** same again, import the Linaria `styled` tag and make a
`StyledLayout` component:

```js
import { styled } from 'linaria/react'

const StyledLayout = styled.main``
```

As this is wrapping the whole project I'll need to define a class for
the `div` on this component:

```js
const StyledLayout = styled.main`
  .page-wrapper {
    margin: 0 auto;
    max-width: 960px;
    padding: 0 1.0875rem 1.45rem;
  }
`
```

Apply the class to the div in the component and remove the `main` tag
wrapping the components `children`:

```jsx {4-5}
return (
  <StyledLayout className={globals}>
    <Header siteTitle={data.site.siteMetadata.title} />
    <div className="page-wrapper">
      <>{children}</>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.org">Gatsby</a>
      </footer>
    </div>
  </StyledLayout>
)
```

That's it for the components and taking a look at the pages none of
them have any styles in them.

So now the `StyledLayout` is where I could apply the styles to the
`h1` and `p` elements in the pages. If I wanted to I could style the
rest of the projects elements here.

But I'm not! That's it for this one.

## Video Detailing the Process

Here's a video of me detailing the process.

<YouTube youTubeId="WUJo8rnMvbI" />

## Resources

Here's some resources on CSS-in-JS performance I found interesting.

- [The unseen performance costs of modern CSS-in-JS libraries in React
  apps]
- [CSS-in-JS Performance Cost - Mitigating Strategies]

<!-- Links -->

[the unseen performance costs of modern css-in-js libraries in react apps]:
  https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/
[css-in-js performance cost - mitigating strategies]:
  https://www.infoq.com/news/2020/01/css-cssinjs-performance-cost/
[https://www.freecodecamp.org/news/the-tradeoffs-of-css-in-js-bee5cf926fdb/]:
  https://www.freecodecamp.org/news/the-tradeoffs-of-css-in-js-bee5cf926fdb/
[linaria docs for benefits]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md
[css is downloaded and parsed separately from js]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#1-css-is-downloaded-and-parsed-separately-from-js
[no extra parsing needed for css]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#2-no-extra-parsing-needed-for-css
[no style duplication on ssr]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#3-no-style-duplication-on-ssr
[catch errors early due to build-time evaluation]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#4-catch-errors-early-due-to-build-time-evaluation
[familiar css syntax]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#5-familiar-css-syntax
[works without javascript]:
  https://github.com/callstack/linaria/blob/master/docs/BENEFITS.md#6-works-without-javascript
[jack the example]:
  https://github.com/callstack/linaria/blob/master/docs/BASICS.md#adding-global-styles
[brevity]: https://dictionary.cambridge.org/dictionary/english/brevity
[known issue]:
  https://github.com/silvenon/gatsby-plugin-linaria#error-cannot-find-module-core-jsmodulespolyfill
[tl;dr to the video]: #video-detailing-the-process
