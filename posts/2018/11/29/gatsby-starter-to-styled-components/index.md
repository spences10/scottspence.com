---
date: 2018-11-29
title: Convert the Gatsby default starter to styled-components
tags: ['learning', 'guide', 'gatsby', 'getting-started']
isPrivate: false
---

<script>
  import { YouTube } from 'sveltekit-embed'
</script>

Let's go through getting styled-components working with the Gatsby
default starter.

<YouTube youTubeId="O5sWySCr668" />

In this example we're going to use the Gatsby default starter you get
with [CodeSandbox] and add in styled-components, so first up, open a
new CodeSandbox, go to `https://codesandbox.io/s/github` and select
Gatsby from the SERVER TEMPLATES.

## 1. Dependencies

In the dependencies section of the CodeSandbox editor you'll need to
add the following:

```bash
gatsby-plugin-styled-components
styled-components
babel-plugin-styled-components
```

## 2. Config

Now we need to change `gatsby-config.js` to incorporate the new
dependencies we've just added. It doesn't have any configuration
options so it can just go in as an extra line on the config, in this
case I'm adding it after the `gatsby-plugin-sharp` plugin:

```js
'gatsby-transformer-sharp',
'gatsby-plugin-sharp',
'gatsby-plugin-styled-components',
```

Don't forget the comma at the end 👍

## 3. Global Style

Now that we're ready to rock n' roll with styled-components we need to
remove the currently applied styled in the default starter and apply
our own.

In the `src/components/layout.js` component there's an import for
`layout.css` this is the CSS reset for the starter if we remove the
import from here we'll see the styles for border and font be reset. We
can now delete the `layout.css` file and create out own CSS reset
using the `createGlobalStyle` function from styled-components.

Create a new folder `theme`, in this example it's in `src/theme` and
add a `globalStyle.js` file in there.

This will export a `GlobalStyle` component for us to use throughout
the app.

Let's add in a Google font and reset the `padding` and `margin`, for
visual feedback we're going to add the font directly to the body
element.

<!-- cSpell:ignore Kodchasan -->

```js
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Kodchasan:400,700');
  body {
    padding: 0;
    margin: 0;
    font-family: Kodchasan;
  }
  a {
    text-decoration: none;
  }
  ul {
    margin: 0 auto;
    list-style-type: none;
  }
`
```

Ok, now we can use the export component here to apply styles globally
in the app. So we need to have this as high up the component tree as
possible, in this case that is in the `layout.js` component as it
wraps all the pages in this project.

In `layout.js` import the `GlobalStyle` component.

```js
import Header from './header'
import { GlobalStyle } from '../theme/globalStyle'
```

Then add it in with the other components being rendered.

```js
render={data => (
  <>
    <GlobalStyle />
    <Helmet
    ...
```

Ok! Global styled applied, we should now see the font change and the
margin around the body of the page change.

Time to use styled-components!

## 4. Use styled-components

Now let's convert all the inline styles used in the starter to
styled-components.

This is the actual styling part, which is moving the existing styles
to styled components, working from top to bottom of the file
structure, changing:

```
src/components/header.js
src/components/layout.js
src/pages/index.js
```

**header.js**

```js
import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

const HeaderWrapper = styled.div`
  background: rebeccapurple;
  margin-bottom: 1.45rem;
`

const Headline = styled.div`
  margin: 0 auto;
  max-width: 960;
  padding: 1.45rem 1.0875rem;
  h1 {
    margin: 0;
  }
`

const StyledLink = styled(Link)`
  color: white;
  textDecoration: none;
`

const Header = ({ siteTitle }) => (
  <HeaderWrapper>
    <Headline>
      <h1>
        <StyledLink to="/">{siteTitle}</StyledLink>
      </h1>
    </Headline>
  </HeaderWrapper>
)

export default Header
```

**layout.js**

```js
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import styled from 'styled-components'

import Header from './header'
import { GlobalStyle } from '../theme/globalStyle'

const ContentWrapper = styled.div`
  margin: 0 auto;
  maxWidth: 960;
  padding: 0px 1.0875rem 1.45rem;
  paddingTop: 0;
`

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <GlobalStyle />
        <Helmet
          title={data.site.siteMetadata.title}
          meta={[
            { name: 'description', content: 'Sample' },
            { name: 'keywords', content: 'sample, something' },
          ]}
        >
          <html lang="en" />
        </Helmet>
        <Header siteTitle={data.site.siteMetadata.title} />
        <ContentWrapper>{children}</ContentWrapper>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
```

**index.js**

```js
import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

import Layout from '../components/layout'
import Image from '../components/image'

const ImgWrapper = styled.div`
  max-width: 300px;
  margin-bottom: 1.45rem;
`

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <ImgWrapper>
      <Image />
    </ImgWrapper>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage
```

## 5. Done

**Thanks for reading**

Here's the [example code] we worked on if you need reference. 👀

[codesandbox]: https://codesandbox.io
[example code]: https://codesandbox.io/s/yp3z16yw11
