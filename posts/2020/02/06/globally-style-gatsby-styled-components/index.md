---
date: 2020-02-06
title:
  Globally Style the Gatsby Default Starter with styled-components v5
tags: ['learning', 'gatsby', 'guide', 'mdx', 'markdown']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

I'm going to go over globally styling the Gatsby Default Starter with
styled-components v5, I've done this in the [past with
styled-components v4] but I've changed my approach and want to
document it.

I'll be swapping out the styles included with a CSS reset and adding
in global style with the styled-components `createGlobalStyle` helper
function and also adding in the styled-components theme provider.

To start I'll make a new Gatsby project using npx:

```bash
npx gatsby new gatsby-starter-styled-components
```

## Install styled-components dependencies

I'm using yarn to install my dependencies, the backslash is to have
the packages on multiple lines instead of one long line:

```bash
yarn add gatsby-plugin-styled-components \
  styled-components \
  babel-plugin-styled-components \
  styled-reset
```

## Configure `gatsby-plugin-styled-components` and `createGlobalStyle`

Pop `gatsby-plugin-styled-components` into the `gatsby-config.js` file
`plugins` array:

```js {2}
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    {
```

Now I'm going to create a `global-style.js` file in a new directory
`src/theme` then import the styled-components helper function
`createGlobalStyle` into that, this is where the styles for the site
are going to live now.

Create the dir and file with the terminal command:

```bash
mkdir src/theme && touch src/theme/global-style.js
```

The base styles go in here, along with the `styled-reset`.

To start with I'll create the `GlobalStyle` object and add in the the
reset.

```jsx
import { createGlobalStyle } from 'styled-components'
import reset from 'styled-reset'

export const GlobalStyle = createGlobalStyle`
  ${reset}
`
```

## Remove current styling

Remove the current styling that is used in the `<Layout>` component,
it's the `import './layout.css'` line, I'll also delete the
`layout.css` file as I'm going to be adding in my styles.

```jsx {5}
import { graphql, useStaticQuery } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Header from './header'
import './layout.css'
```

Now the site has the base browser default styles, time to add in my
own styles. Before that I'm going to confirm the reset is doing it
thing.

## Confirm CSS reset

Now I have the base browser styles I'm going to confirm the CSS reset
in the `<Layout>` component. This is where I've removed the previous
global styles (`layout.css`) from.

```jsx {4,19}
import { graphql, useStaticQuery } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import { GlobalStyle } from "../theme/global-style"
import Header from "./header"

const Layout = ({ children }) => {
  // static query for the data here
  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
        <GlobalStyle />
        <main>{children}</main>
        <footer>
```

In the code example here 👆I've I removed the `useStaticQuery` hook
for readability.

![reset page]

Ok, cool, looks pretty reset to me!

## Create the new browser base styles

Time to add in some more styles to the global style. First, the
`box-sizing` reset, take a look at the CSS Tricks post on [Box Sizing]
for a great explanation of why we do this.

```jsx {7-12}
import { createGlobalStyle } from 'styled-components'
import reset from 'styled-reset'

export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
  }
`
```

Then I'm adding in the smooth scroll html property and some additional
styles for base font size and colour along with base line height
letter spacing and background colour.

<!-- cSpell:ignore behavior,Segoe,Tahoma,Verdana -->

```jsx {12-15,17-21}
import { createGlobalStyle } from 'styled-components'
import reset from 'styled-reset'

export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: '#1a202c';
  }
  body {
    line-height: 1.5;
    letter-spacing: 0;
    background-color: '#f7fafc';
  }
`
```

## Place `GlobalStyle` at the top of the React tree 🌳

I'm adding this as high up the component tree as possible so that the
global styles will affect everything that is 'underneath' it.

In the case of the Gatsby Default Starter you'll notice that the
`<Layout>` component wraps a the `index.js` page, `page-2.js` and the
`404.js` page so adding the `<GlobalStyle />` component here is a
sound option.

There is an alternative to adding it to the layout and that is to use
the Gatsby Browser and Gatsby SSR API [wrapRootElement].

If I add in the following code to `gatsby-browser.js` the styles are
applied.

```js
import React from 'react'
import Layout from './src/components/layout'
import { GlobalStyle } from './src/theme/global-style'

export const wrapRootElement = ({ element }) => (
  <>
    <GlobalStyle />
    <Layout>{element}</Layout>
  </>
)
```

I also have a double header, that's because the layout component is
still wrapping the index page, page 2 and the 404 page. I'll remove
the layout component from those locations so I have it in one place to
manage.

## Make a Root Wrapper to keep things DRY 🌵

I also need to add the same code into `gatsby-ssr.js` so so that the
styles are rendered on the server when the site is built.

Rather than have the code duplicated in the two files I'll create a
`root-wrapper.js` file _(you can call it what you like!)_ and add it
to the root of the project. I'll import that into both the
`gatsby-browser.js` and `gatsby-ssr.js` files:

```js
import { wrapRootElement as wrap } from './root-wrapper'

export const wrapRootElement = wrap
```

## Global fonts with `gatsby-plugin-google-fonts`

Onto the main reason for this post, with the [v5 release] of
styled-components the use of `@imports` in `createGlobalStyle` isn't
working, (that approach is [detailed here]) it's recommended that you
embed these into your HTML index file, etc.

> NOTE: At this time we recommend not using @import inside of
> `createGlobalStyle`. We're working on better behavior for this
> functionality but it just doesn't really work at the moment and it's
> better if you just embed these imports in your HTML index file, etc.

But! As I'm using Gatsby, of course, _**"There's a Plugin For
That™️"**_ so I'm going to use `gatsby-plugin-google-fonts` for this,
I'm using this in place of `gatsby-plugin-web-font-loader` because it
uses `display=swap`.

```bash
yarn add gatsby-plugin-google-fonts
```

Configure, I'll add three fonts, sans, sans serif and monospace to the
Gatsby plugin array in `gatsby-config.js`:

<!-- cSpell:ignore arvo,cambay -->

```js
{
  resolve: `gatsby-plugin-google-fonts`,
  options: {
    fonts: [
      `cambay\:400,700`,
      `arvo\:400,700`,
      `ubuntu mono\:400,700`,
    ],
    display: 'swap',
  },
},
```

I can now use these fonts throughout my site.

## styled-components Theme provider

The [styled-components ThemeProvider] is a great solution for managing
your styles throughout a project.

Part of the inspiration for my approach came from Sid's talk at React
Advanced which [I wrote about] and part from watching the Tailwind CSS
courses from Adam Wathan on Egghead.io check out the playlist here:
[Introduction to Tailwind and the Utility first workflow]

With the ThemeProvider I can have things like colours, sizes, font
weights in one place so that there is a consistent set of presets to
choose from when styling.

In the `global-style.js` file I'm creating a theme object to hold all
the values for the theme.

For the font I'll add in the types I defined in the Gatsby config, for
serif, sans serif and monospace.

```jsx {4-10}
import { createGlobalStyle } from 'styled-components'
import reset from 'styled-reset'

export const theme = {
  font: {
    sans: 'Cambay, sans-serif',
    serif: 'Arvo, sans',
    monospace: '"Ubuntu Mono", monospace',
  },
}

export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: '#1a202c';
  }
  body {
    line-height: 1.5;
    letter-spacing: 0;
    background-color: '#f7fafc';
  }
`
```

Now I'll need to add the `<ThemeProvider>` high up in the React render
tree, same as with the global style, I'll add it to the
`root-wrapper.js` file.

```jsx {2,4,7,10}
import React from 'react'
import { ThemeProvider } from 'styled-components'
import Layout from './src/components/layout'
import { GlobalStyle, theme } from './src/theme/global-style'

export const wrapRootElement = ({ element }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Layout>{element}</Layout>
  </ThemeProvider>
)
```

When I want to pick a font type to use in the project I can use the
`theme` object and pick out the desired type.

Like setting the HTML font-family to sans serif:

```jsx {10}
export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: ${({ theme }) => theme.font.sans};
    font-size: 16px;
    color: '#1a202c';
  }
  body {
    line-height: 1.5;
    letter-spacing: 0;
    background-color: '#f7fafc';
  }
`
```

The base font is now set to Cambay, why stop there though, I'll bring
in some fonts sizes and font weights from the [Tailwind full config]
and add them to the `theme` object.

```jsx {10-32,45}
import { createGlobalStyle } from 'styled-components'
import reset from 'styled-reset'

export const theme = {
  font: {
    sans: 'Cambay, sans-serif',
    serif: 'Arvo, sans',
    monospace: '"Ubuntu Mono", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '4rem',
  },
  fontWeight: {
    hairline: '100',
    thin: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
}

export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: ${({ theme }) => theme.font.sans};
    font-size: ${({ theme }) => theme.fontSize.lg};
    color: '#1a202c';
  }
  body {
    line-height: 1.5;
    letter-spacing: 0;
    background-color: '#f7fafc';
  }
`
```

I'll add the base font at `.lg` (`1.125rem`), I'll also add in line
height and line spacing defaults but I'll save adding the whole config
here to save you a code wall, you get the idea though, right?

Here's the rest of the GlobalStyle with defaults applied.

```jsx {12,15-17}
export const GlobalStyle = createGlobalStyle`
  ${reset}

  *, *:before, *:after {
    box-sizing: border-box;
  }
  html {
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-family: ${({ theme }) => theme.font.sans};
    font-size: ${({ theme }) => theme.fontSize.lg};
    color: ${({ theme }) => theme.colours.grey[900]};
  }
  body {
    line-height: ${({ theme }) => theme.lineHeight.relaxed};
    letter-spacing: ${({ theme }) => theme.letterSpacing.wide};
    background-color: ${({ theme }) => theme.colours.white};
  }
`
```

## Shared Page Elements

The current page is still missing basic styles for `h1` and `p` so I'm
going to create those in a new directory
`src/components/page-elements`

```bash
mkdir src/components/page-elements
touch src/components/page-elements/h1.js
touch src/components/page-elements/p.js
```

And add some base styles to those for `h1`:

```jsx
import styled from 'styled-components'

export const H1 = styled.h1`
  font-size: ${({ theme }) => theme.fontSize['4xl']};
  font-family: ${({ theme }) => theme.font.serif};
  margin-top: ${({ theme }) => theme.spacing[8]};
  line-height: ${({ theme }) => theme.lineHeight.none};
`
```

And the same sort of thing for the `p`:

```jsx
import styled from 'styled-components'

export const P = styled.p`
  font-size: ${({ theme }) => theme.fontSize.base};
  margin-top: ${({ theme }) => theme.spacing[3]};
  strong {
    font-weight: bold;
  }
  em {
    font-style: italic;
  }
`
```

Then it's a case of replacing the `h1`'s and `p`'s in the project to
use the styled components.

Here's the `index.js` file as an example:

```jsx {4-5,11-13}
import { Link } from 'gatsby'
import React from 'react'
import Image from '../components/image'
import { H1 } from '../components/page-elements/h1'
import { P } from '../components/page-elements/p'
import SEO from '../components/seo'

const IndexPage = () => (
  <>
    <SEO title="Home" />
    <H1>Hi people</H1>
    <P>Welcome to your new Gatsby site.</P>
    <P>Now go build something great.</P>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link>
  </>
)

export default IndexPage
```

## Export all your styled-components from an index file

As the amount of page elements grows you may want to consider using an
`index.js` file instead of having an import for each individual
component you can import from one file.

Let's take a quick look at that, so let's say I import the `h1` and
`p` into a file, it'll looks something like this:

```jsx
import { H1 } from '../components/page-elements/h1'
import { P } from '../components/page-elements/p'
```

If you have several elements your using in the file the imports could
get a bit cluttered.

I've taken to creating an `index.js` file that will export all the
components, like this:

```jsx
export * from './h1'
export * from './p'
```

Then when importing the components it will look like this:

```jsx
import { H1, P } from '../components/page-elements'
```

That's it for this one!

## Here's a video detailing the process 📺

<YouTube youTubeId="8jlh_FyuM8c" />

## Thanks for reading 🙏

Please take a look at my other content if you enjoyed this.

Follow me on [Twitter] or [Ask Me Anything] on GitHub.

## Resources

<!-- cSpell:ignore Siddharth,Kshetrapal -->

- [Design Systems Design System - Siddharth Kshetrapal]
- [Tailwind full config]
- [Introduction to Tailwind and the Utility first workflow]
- [Design and Implement Common Tailwind Components]
- [Build a Responsive Navbar with Tailwind]
- [Build and Style a Dropdown in Tailwind]

<!-- Links -->

[past with styled-components v4]:
  https://scottspence.com/posts/gatsby-starter-to-styled-components/
[wraprootelement]:
  https://www.gatsbyjs.com/docs/browser-apis/#wrapRootElement
[v5 release]: https://styled-components.com/releases#v5.0.0
[detailed here]:
  https://scottspence.com/posts/gatsby-starter-to-styled-components/#3-global-style
[box sizing]: https://css-tricks.com/box-sizing/#article-header-id-3
[styled-components themeprovider]:
  https://styled-components.com/docs/api#themeprovider
[introduction to tailwind and the utility first workflow]:
  https://egghead.io/playlists/introduction-to-tailwind-and-the-utility-first-workflow-0b697b10
[design and implement common tailwind components]:
  https://egghead.io/playlists/design-and-implement-common-tailwind-components-8fbb9b19
[build a responsive navbar with tailwind]:
  https://egghead.io/playlists/build-a-responsive-navbar-with-tailwind-4d328a35
[build and style a dropdown in tailwind]:
  https://egghead.io/playlists/build-and-style-a-dropdown-in-tailwind-7f34fead
[i wrote about]:
  https://scottspence.com/posts/react-advanced-london-2019/#siddharth-kshetrapal---design-systems-design-system
[design systems design system - siddharth kshetrapal]:
  https://www.youtube.com/watch?v=Dd-Y9K7IKmk&feature=emb_title
[tailwind full config]:
  https://github.com/tailwindcss/designing-with-tailwindcss/blob/master/01-getting-up-and-running/07-customizing-your-design-system/tailwind-full.config.js
[twitter]: https://twitter.com/spences10
[ask me anything]: https://github.com/spences10/ama

<!-- Images -->

[reset page]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858538/scottspence.com/reset-page-39c26fbeac89322ffc9491b0efa0ad13.png
